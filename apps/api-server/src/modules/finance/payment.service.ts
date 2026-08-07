import { prisma } from '@repo/database';
import { PaymentMethod } from '@prisma/client';

export class PaymentService {
  /**
   * Process a payment, generate invoice, and write to General Ledger
   */
  static async processPayment(
    tenantId: string,
    idempotencyKey: string,
    data: {
      orderId: string;
      amount: number;
      paymentMethod: PaymentMethod;
      referenceCode?: string;
      currentVersion: number;
    },
    userId?: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate Order
      const order = await tx.order.findFirst({
        where: { id: data.orderId, tenantId, isDeleted: false },
      });
      if (!order) throw new Error('ORDER_NOT_FOUND');

      // OCC Validation
      if (order.version !== data.currentVersion) {
        throw new Error('CONCURRENCY_CONFLICT');
      }

      if (order.status === 'CLOSED' || order.status === 'VOIDED' || order.status === 'CANCELLED') {
        throw new Error('INVALID_ORDER_STATE');
      }

      // 2. Resolve or Create Invoice
      let invoice = await tx.invoice.findFirst({
        where: { orderId: order.id, tenantId, isDeleted: false },
      });

      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            tenantId,
            branchId: order.branchId,
            orderId: order.id,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            total: order.totalAmount,
            status: 'ISSUED',
            issuedAt: new Date(),
            createdBy: userId,
          },
        });
      }

      if (invoice.status === 'PAID') {
        throw new Error('INVOICE_ALREADY_PAID');
      }

      // 3. Create Payment
      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: invoice.id,
          method: data.paymentMethod,
          amount: data.amount,
          referenceCode: data.referenceCode,
          status: 'CAPTURED',
          idempotencyKey,
          capturedAt: new Date(),
          createdBy: userId,
        },
      });

      // 4. Check Invoice Balance
      const allPayments = await tx.payment.findMany({
        where: { invoiceId: invoice.id, tenantId, status: 'CAPTURED', isDeleted: false },
      });

      const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      const isFullyPaid = totalPaid >= Number(invoice.total);

      if (isFullyPaid) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PAID', updatedBy: userId },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            status: 'PAID',
            version: { increment: 1 },
            updatedBy: userId,
          },
        });
      } else {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: { status: 'PARTIALLY_PAID', updatedBy: userId },
        });
      }

      // 5. Accounting: Double-Entry Journal
      // Fetch or auto-seed baseline ledger accounts for the transaction
      let assetAccount = await tx.ledgerAccount.findFirst({
        where: { tenantId, type: 'ASSET', isDeleted: false },
      });
      if (!assetAccount) {
        assetAccount = await tx.ledgerAccount.create({
          data: {
            tenantId,
            code: '1000',
            name: 'Cash / Bank',
            type: 'ASSET',
            createdBy: userId,
          },
        });
      }

      let revenueAccount = await tx.ledgerAccount.findFirst({
        where: { tenantId, type: 'REVENUE', isDeleted: false },
      });
      if (!revenueAccount) {
        revenueAccount = await tx.ledgerAccount.create({
          data: {
            tenantId,
            code: '4000',
            name: 'Sales Revenue',
            type: 'REVENUE',
            createdBy: userId,
          },
        });
      }

      const journal = await tx.journal.create({
        data: {
          tenantId,
          description: `Payment for Order ${order.id}`,
          referenceId: payment.id,
          referenceType: 'PAYMENT',
          isPosted: true,
          postedAt: new Date(),
          createdBy: userId,
          journalEntries: {
            create: [
              {
                tenantId,
                ledgerAccountId: assetAccount.id,
                entryType: 'DEBIT',
                amount: data.amount,
                description: 'Payment Captured',
                createdBy: userId,
              },
              {
                tenantId,
                ledgerAccountId: revenueAccount.id,
                entryType: 'CREDIT',
                amount: data.amount,
                description: 'Sales Revenue Recognized',
                createdBy: userId,
              },
            ],
          },
        },
      });

      return { payment, invoice, journal };
    });
  }

  static async listPayments(
    tenantId: string,
    options: { invoiceId?: string; limit: number; cursor?: string },
  ) {
    const { invoiceId, limit, cursor } = options;

    const payments = await prisma.payment.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(invoiceId ? { invoiceId } : {}),
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        invoice: true,
      },
    });

    const hasMore = payments.length > limit;
    const data = hasMore ? payments.slice(0, -1) : payments;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { data, hasMore, nextCursor };
  }

  static async getPayment(tenantId: string, id: string) {
    return await prisma.payment.findFirst({
      where: { id, tenantId, isDeleted: false },
      include: {
        invoice: true,
      },
    });
  }
}
