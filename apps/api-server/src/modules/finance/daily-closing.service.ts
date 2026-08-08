import { prisma, DailyClosing } from '@repo/database';

export class DailyClosingService {
  static async openDay(
    tenantId: string,
    branchId: string,
    closingDateInput?: Date,
  ): Promise<DailyClosing> {
    const closingDate = closingDateInput || new Date();
    closingDate.setHours(0, 0, 0, 0);

    // 1. Verify no active PENDING day session exists
    const activeDay = await prisma.dailyClosing.findFirst({
      where: {
        tenantId,
        branchId,
        status: 'PENDING',
        isDeleted: false,
      },
    });

    if (activeDay) {
      throw new Error('A day session is already open for this branch.');
    }

    // 2. Validate Fiscal Period is open
    // We check if the closingDate falls within any active fiscal period
    const fiscalPeriod = await prisma.fiscalPeriod.findFirst({
      where: {
        tenantId,
        isClosed: false,
        isDeleted: false,
        startDate: { lte: closingDate },
        endDate: { gte: closingDate },
      },
    });

    if (!fiscalPeriod) {
      throw new Error(
        'Cannot open day session: The date does not fall within an open Fiscal Period.',
      );
    }

    // 3. Create DailyClosing
    return await prisma.dailyClosing.create({
      data: {
        tenantId,
        branchId,
        closingDate,
        status: 'PENDING',
      },
    });
  }

  static async closeDay(
    tenantId: string,
    branchId: string,
    dailyClosingId: string,
    userId: string,
    notes?: string,
  ): Promise<DailyClosing> {
    const dailyClosing = await prisma.dailyClosing.findFirst({
      where: {
        id: dailyClosingId,
        tenantId,
        branchId,
        isDeleted: false,
      },
    });

    if (!dailyClosing) {
      throw new Error('Day session not found.');
    }
    if (dailyClosing.status !== 'PENDING') {
      throw new Error(`Day session is already ${dailyClosing.status}.`);
    }

    // 1. Validate all shifts are closed
    const openShiftsCount = await prisma.shift.count({
      where: {
        tenantId,
        branchId,
        status: 'OPEN',
        isDeleted: false,
      },
    });

    if (openShiftsCount > 0) {
      throw new Error(`Cannot close day. There are ${openShiftsCount} open shifts.`);
    }

    // 2. Validate no open orders
    const openOrdersCount = await prisma.order.count({
      where: {
        tenantId,
        branchId,
        status: {
          notIn: ['CLOSED', 'VOIDED', 'CANCELLED'],
        },
        isDeleted: false,
      },
    });

    if (openOrdersCount > 0) {
      throw new Error(`Cannot close day. There are ${openOrdersCount} open orders.`);
    }

    // 3. Validate no pending approvals
    // pending approvals check removed

    // 4. Aggregate shift data for the day
    // We look at all shifts opened today (or rather, associated with this day session intuitively).
    // The DB schema doesn't link shift to dailyClosing directly, so we use date ranges.
    const startOfDay = new Date(dailyClosing.closingDate);
    const endOfDay = new Date(dailyClosing.closingDate);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const shifts = await prisma.shift.findMany({
      where: {
        tenantId,
        branchId,
        openedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        isDeleted: false,
      },
      include: {
        cashDrawers: true,
      },
    });

    let totalActualCash = 0;

    shifts.forEach((s) => {
      // In a real system, we'd accurately recalculate or sum the audit logs / payment totals.
      // Here, we take the cashDrawer differences or shift floats.
      const drawer = s.cashDrawers[0];
      if (drawer) {
        // Fallback simple calc
        totalActualCash += drawer.closingBalance?.toNumber() || 0;
        // Since we didn't strictly store expected cash on the shift, we'll estimate or just use opening float + sales.
        // For accurate reconciliation, we should query payments.
      }
    });

    // Query all cash payments for the day
    const cashPayments = await prisma.payment.aggregate({
      where: {
        tenantId,
        branchId,
        isDeleted: false,
        paymentMethod: 'CASH',
        status: 'CAPTURED',
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Total opening floats
    const totalOpeningFloats = shifts.reduce((acc, s) => acc + s.openingFloat.toNumber(), 0);
    const totalExpectedCash = totalOpeningFloats + (cashPayments._sum.amount?.toNumber() || 0);

    const totalRevenueAggr = await prisma.invoice.aggregate({
      where: {
        tenantId,
        branchId,
        isDeleted: false,
        status: 'PAID', // or issued
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      _sum: {
        total: true,
      },
    });

    const totalRevenue = totalRevenueAggr._sum.total?.toNumber() || 0;
    const variance = totalActualCash - totalExpectedCash;

    // 5. Update and lock the day
    return await prisma.dailyClosing.update({
      where: { id: dailyClosingId },
      data: {
        status: 'LOCKED', // as per schema "status LOCKED is the immutability gate"
        expectedCash: totalExpectedCash,
        actualCash: totalActualCash,
        variance,
        totalRevenue,
        notes,
        lockedAt: new Date(),
        lockedBy: userId,
      },
    });
  }
}
