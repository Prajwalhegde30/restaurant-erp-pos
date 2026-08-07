import { prisma } from '@repo/database';
import { CouponType, CouponStatus, OrderStatus } from '@repo/database';

export class CouponService {
  /**
   * Validates a coupon and calculates the discount amount for a given order.
   */
  static async validateCoupon(
    tenantId: string,
    code: string,
    orderId: string,
    customerId?: string,
  ) {
    return await prisma.$transaction(async (tx) => {
      const coupon = await tx.coupon.findFirst({
        where: { tenantId, code, isDeleted: false },
      });

      if (!coupon) {
        throw new Error('Coupon not found or invalid');
      }

      if (coupon.status !== CouponStatus.ACTIVE) {
        throw new Error(`Coupon is ${coupon.status.toLowerCase()}`);
      }

      const now = new Date();
      if (coupon.validFrom && now < coupon.validFrom) {
        throw new Error('Coupon is not yet valid');
      }
      if (coupon.validUntil && now > coupon.validUntil) {
        throw new Error('Coupon has expired');
      }

      if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
        throw new Error('Coupon usage limit reached');
      }

      // Per-customer usage limit
      if (coupon.maxUsesPerCustomer !== null && customerId) {
        const usageCount = await tx.couponCustomerUsage.count({
          where: { tenantId, couponId: coupon.id, customerId },
        });
        if (usageCount >= coupon.maxUsesPerCustomer) {
          throw new Error('You have reached the maximum usage for this coupon');
        }
      } else if (coupon.maxUsesPerCustomer !== null && !customerId) {
        throw new Error('Customer context required to validate this coupon');
      }

      // Fetch order and items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: { include: { menuItem: true } } },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      if (order.tenantId !== tenantId) {
        throw new Error('Tenant isolation violation');
      }

      if (!coupon.isStackable && order.couponId && order.couponId !== coupon.id) {
        throw new Error('Another coupon is already applied and this coupon is not stackable');
      }

      let applicableItems = order.orderItems;
      const hasItemRestrictions = coupon.applicableItemIds.length > 0;
      const hasCategoryRestrictions = coupon.applicableCategoryIds.length > 0;

      if (hasItemRestrictions || hasCategoryRestrictions) {
        applicableItems = applicableItems.filter((item) => {
          const itemMatch = hasItemRestrictions
            ? coupon.applicableItemIds.includes(item.menuItemId)
            : false;
          const categoryMatch = hasCategoryRestrictions
            ? coupon.applicableCategoryIds.includes(item.menuItem.categoryId)
            : false;
          return itemMatch || categoryMatch;
        });
      }

      const applicableSubtotal = applicableItems.reduce(
        (sum, item) => sum + Number(item.totalPrice),
        0,
      );
      const orderTotal = Number(order.totalAmount);

      if (applicableItems.length === 0) {
        throw new Error('Coupon does not apply to any items in this order');
      }

      if (coupon.minOrderValue !== null && orderTotal < Number(coupon.minOrderValue)) {
        throw new Error(`Order total must be at least ${coupon.minOrderValue}`);
      }

      // Discount calculation engine
      let discountAmount = 0;
      const value = Number(coupon.value);

      switch (coupon.type) {
        case CouponType.PERCENTAGE:
          discountAmount = applicableSubtotal * (value / 100);
          if (
            coupon.maxDiscountValue !== null &&
            discountAmount > Number(coupon.maxDiscountValue)
          ) {
            discountAmount = Number(coupon.maxDiscountValue);
          }
          break;
        case CouponType.FIXED_AMOUNT:
          discountAmount = value;
          break;
        case CouponType.BOGO:
          // Standard BOGO: 100% off cheapest applicable item
          if (applicableItems.length >= 2) {
            const cheapestItem = [...applicableItems].sort(
              (a, b) => Number(a.unitPrice) - Number(b.unitPrice),
            )[0];
            discountAmount = Number(cheapestItem.unitPrice);
          } else {
            throw new Error('BOGO requires at least 2 applicable items');
          }
          break;
      }

      // Ensure discount doesn't exceed applicable total
      if (discountAmount > applicableSubtotal) {
        discountAmount = applicableSubtotal;
      }

      return {
        isValid: true,
        coupon,
        discountAmount,
      };
    });
  }

  /**
   * Applies the coupon to the order (Order integration)
   */
  static async applyCoupon(tenantId: string, code: string, orderId: string, customerId?: string) {
    const { isValid, coupon, discountAmount } = await this.validateCoupon(
      tenantId,
      code,
      orderId,
      customerId,
    );

    if (isValid) {
      // Typically we'd update order total here, but PRD dictates denormalized totals
      // are calculated from order items or stored on order.
      // We will attach the couponId to the Order.
      await prisma.order.update({
        where: { id: orderId },
        data: { couponId: coupon.id },
      });
      return { success: true, discountAmount, couponId: coupon.id };
    }
    return { success: false };
  }

  /**
   * Redeems a coupon upon order payment (Idempotent Redemption Workflow)
   */
  static async redeemCoupon(tenantId: string, orderId: string, customerId?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { Coupon: true },
      });

      if (!order || order.tenantId !== tenantId) {
        throw new Error('Order not found or tenant mismatch');
      }

      if (!order.Coupon) {
        return { redeemed: false, message: 'No coupon attached to order' };
      }

      const coupon = order.Coupon;

      if (order.status !== OrderStatus.PAID) {
        throw new Error('Coupon can only be redeemed on PAID orders');
      }

      // Idempotency check: see if usage already recorded for this order
      const existingUsage = await tx.couponCustomerUsage.findFirst({
        where: { tenantId, orderId, couponId: coupon.id },
      });

      if (existingUsage) {
        return { redeemed: true, idempotent: true }; // Already redeemed
      }

      // Create usage tracking record
      if (customerId) {
        await tx.couponCustomerUsage.create({
          data: {
            tenantId,
            couponId: coupon.id,
            customerId,
            orderId,
          },
        });
      }

      // Increment coupon global usage
      await tx.coupon.update({
        where: { id: coupon.id },
        data: { currentUses: { increment: 1 } },
      });

      return { redeemed: true, idempotent: false };
    });
  }
}
