import { prisma } from '@repo/database';
import { MembershipTier, LoyaltyTransactionType, OrderStatus } from '@repo/database';

export class LoyaltyService {
  /**
   * Calculate and accrue points for a paid order idempotently.
   */
  static async accruePointsForOrder(tenantId: string, orderId: string, userId?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Order and verify status
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { Customer: { include: { memberships: true } } },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.tenantId !== tenantId) {
        throw new Error('Tenant isolation violation');
      }

      if (!order.customerId || !order.Customer) {
        return null; // No customer attached, no points
      }

      if (order.status !== OrderStatus.PAID) {
        throw new Error('Points can only be accrued for PAID orders');
      }

      // 2. Idempotency & Duplicate prevention: Check if points already accrued for this order
      const existingLedger = await tx.loyaltyLedger.findFirst({
        where: {
          tenantId,
          orderId,
          type: LoyaltyTransactionType.EARNED,
          isDeleted: false,
        },
      });

      if (existingLedger) {
        return existingLedger; // Idempotent return
      }

      // 3. Loyalty calculation engine based on Membership Tier
      // Base calculation: 1 point per 1 unit of currency of totalAmount
      const basePoints = Math.floor(Number(order.totalAmount));
      if (basePoints <= 0) return null;

      let multiplier = 1.0;
      const membership = order.Customer.memberships.find(
        (m) => m.tenantId === tenantId && m.isDeleted === false,
      );
      const tier = membership?.tier || MembershipTier.BASIC;

      switch (tier) {
        case MembershipTier.BASIC:
          multiplier = 1.0;
          break;
        case MembershipTier.SILVER:
          multiplier = 1.2;
          break;
        case MembershipTier.GOLD:
          multiplier = 1.5;
          break;
        case MembershipTier.PLATINUM:
          multiplier = 2.0;
          break;
      }

      const pointsEarned = Math.floor(basePoints * multiplier);

      // 4. Immutable LoyaltyLedger entry
      const ledgerEntry = await tx.loyaltyLedger.create({
        data: {
          tenantId,
          customerId: order.customerId,
          orderId,
          points: pointsEarned,
          type: LoyaltyTransactionType.EARNED,
          reason: `Accrual for Order ${orderId}`,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return ledgerEntry;
    });
  }

  /**
   * Get derived customer balance safely by aggregating ledger entries
   */
  static async getCustomerBalance(tenantId: string, customerId: string) {
    const ledgers = await prisma.loyaltyLedger.findMany({
      where: {
        tenantId,
        customerId,
        isDeleted: false,
      },
    });

    return ledgers.reduce((balance, entry) => {
      if (
        entry.type === LoyaltyTransactionType.EARNED ||
        entry.type === LoyaltyTransactionType.ADJUSTED
      ) {
        return balance + entry.points;
      } else if (
        entry.type === LoyaltyTransactionType.REDEEMED ||
        entry.type === LoyaltyTransactionType.EXPIRED
      ) {
        return balance - entry.points;
      }
      return balance;
    }, 0);
  }
}
