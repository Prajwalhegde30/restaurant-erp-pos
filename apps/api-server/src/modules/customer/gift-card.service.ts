import { prisma } from '@repo/database';
import {} from '@repo/database';

export class GiftCardService {
  /**
   * Activates a newly issued gift card (creation/activation combined for simplicity in this engine)
   */
  static async activateGiftCard(
    tenantId: string,
    code: string,
    initialValue: number,
    customerId?: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      const existingCard = await tx.giftCard.findFirst({
        where: { tenantId, code },
      });

      if (existingCard) {
        throw new Error('Gift card with this code already exists');
      }

      const card = await tx.giftCard.create({
        data: {
          tenantId,
          code,
          initialValue,
          currentBalance: initialValue,
          status: 'ACTIVE',
          customerId,
        },
      });

      // Immutable transaction history
      await tx.giftCardTransaction.create({
        data: {
          tenantId,
          giftCardId: card.id,
          type: 'ACTIVATION',
          amount: initialValue,
          balanceAfter: initialValue,
        },
      });

      return card;
    });
  }

  /**
   * Validates a gift card for a given amount
   */
  static async validateGiftCard(
    tenantId: string,
    code: string,
    requestedAmount: number,
    customerId?: string,
  ) {
    const card = await prisma.giftCard.findFirst({
      where: { tenantId, code, isDeleted: false },
    });

    if (!card) {
      throw new Error('Gift card not found');
    }

    if (card.status !== 'ACTIVE') {
      throw new Error(`Gift card is ${card.status.toLowerCase()}`);
    }

    if (card.expiresAt && new Date() > card.expiresAt) {
      throw new Error('Gift card has expired');
    }

    if (card.customerId && customerId && card.customerId !== customerId) {
      throw new Error('Gift card does not belong to this customer');
    }

    const currentBalance = Number(card.currentBalance);
    if (currentBalance <= 0) {
      throw new Error('Gift card has zero balance');
    }

    const applicableAmount = Math.min(requestedAmount, currentBalance);

    return {
      isValid: true,
      card,
      applicableAmount,
      remainingBalance: currentBalance - applicableAmount,
    };
  }

  /**
   * Redeems a gift card against an order.
   * This is idempotent per order/payment payload.
   */
  static async redeemGiftCard(
    tenantId: string,
    code: string,
    orderId: string,
    amountToRedeem: number,
    customerId?: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      const card = await tx.giftCard.findFirst({
        where: { tenantId, code, isDeleted: false },
      });

      if (!card) throw new Error('Gift card not found');
      if (card.status !== 'ACTIVE') throw new Error('Gift card not active');
      if (card.expiresAt && new Date() > card.expiresAt) throw new Error('Gift card expired');
      if (card.customerId && customerId && card.customerId !== customerId)
        throw new Error('Gift card does not belong to this customer');

      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('Order not found');
      if (order.tenantId !== tenantId) throw new Error('Tenant isolation violation');

      // Idempotency: Has this card already been redeemed for this exact order payment?
      // Since an order could theoretically have multiple partial redemptions of the SAME card,
      // we need to be careful. However, standard POS idempotent redemption assumes one redemption per card per order.
      const existingTransaction = await tx.giftCardTransaction.findFirst({
        where: {
          tenantId,
          giftCardId: card.id,
          orderId,
          type: 'REDEMPTION',
        },
      });

      if (existingTransaction) {
        return {
          redeemed: true,
          idempotent: true,
          transaction: existingTransaction,
        };
      }

      const currentBalance = Number(card.currentBalance);
      const actualRedemptionAmount = Math.min(amountToRedeem, currentBalance);

      if (actualRedemptionAmount <= 0) {
        throw new Error('Insufficient gift card balance');
      }

      const newBalance = currentBalance - actualRedemptionAmount;
      let newStatus = card.status;

      if (newBalance === 0) {
        newStatus = 'DEPLETED' as never;
      }

      // 1. Update Gift Card balance
      await tx.giftCard.update({
        where: { id: card.id },
        data: {
          currentBalance: newBalance,
          status: newStatus,
        },
      });

      // 2. Create Payment record linking back to Gift Card
      // We assume an Invoice exists or we are creating a generic payment attached to the order's invoice
      const invoice = await tx.invoice.findFirst({
        where: { tenantId, orderId },
      });

      if (!invoice) throw new Error('Invoice not found for order');

      const payment = await tx.payment.create({
        data: {
          tenantId,
          invoiceId: invoice.id,
          status: 'CAPTURED',
          method: 'GIFT_CARD',
          amount: actualRedemptionAmount,
          idempotencyKey: `gc_${card.id}_ord_${orderId}_${Date.now()}`,
          giftCardId: card.id,
          capturedAt: new Date(),
        },
      });

      // 3. Record immutable Gift Card Transaction
      const gcTx = await tx.giftCardTransaction.create({
        data: {
          tenantId,
          giftCardId: card.id,
          orderId,
          paymentId: payment.id,
          type: 'REDEMPTION',
          amount: actualRedemptionAmount,
          balanceAfter: newBalance,
        },
      });

      return {
        redeemed: true,
        idempotent: false,
        amountRedeemed: actualRedemptionAmount,
        remainingBalance: newBalance,
        transaction: gcTx,
      };
    });
  }
}
