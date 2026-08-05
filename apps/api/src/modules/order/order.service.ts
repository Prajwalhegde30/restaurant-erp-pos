import { prisma } from '@repo/database';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';

export class OrderService {
  /**
   * Create a new order with idempotency check
   */
  static async createOrder(
    tenantId: string,
    idempotencyKey: string,
    data: {
      branchId: string;
      diningTableId?: string;
      orderType?: OrderType;
      notes?: string;
    },
    userId?: string,
  ) {
    // Note: Idempotency is largely handled by the middleware (which caches the response),
    // but the database enforces uniqueness on (tenantId, idempotencyKey).
    return await prisma.order.create({
      data: {
        tenantId,
        idempotencyKey,
        branchId: data.branchId,
        diningTableId: data.diningTableId,
        orderType: data.orderType,
        notes: data.notes,
        userId,
      },
    });
  }

  /**
   * Get an order by ID
   */
  static async getOrderById(tenantId: string, orderId: string) {
    return await prisma.order.findFirst({
      where: {
        id: orderId,
        tenantId,
        isDeleted: false,
      },
      include: {
        orderItems: {
          include: {
            orderItemModifierSelections: true,
          },
        },
      },
    });
  }

  /**
   * Get orders for a branch
   */
  static async getOrders(tenantId: string, branchId: string, limit = 50, cursor?: string) {
    const args: Prisma.OrderFindManyArgs = {
      where: {
        tenantId,
        branchId,
        isDeleted: false,
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    };

    if (cursor) {
      args.cursor = { id: cursor };
    }

    const orders = await prisma.order.findMany(args);
    let nextCursor: string | null = null;
    if (orders.length > limit) {
      const nextItem = orders.pop();
      nextCursor = nextItem!.id;
    }

    return { data: orders, nextCursor, hasMore: nextCursor !== null };
  }

  /**
   * Update order status with Optimistic Concurrency Control
   */
  static async updateOrderStatus(
    tenantId: string,
    orderId: string,
    status: OrderStatus,
    currentVersion: number,
    userId?: string,
  ) {
    // Verify current version (OCC)
    const order = await prisma.order.findFirst({
      where: { id: orderId, tenantId, isDeleted: false },
      select: { version: true, status: true },
    });

    if (!order) throw new Error('NOT_FOUND');
    if (order.version !== currentVersion) throw new Error('CONCURRENCY_CONFLICT');

    // Strict state machine validation (AppFlow.md)
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      DRAFT: ['PLACED', 'VOIDED'],
      PLACED: ['IN_PREP', 'CANCELLED'],
      IN_PREP: ['READY'],
      READY: ['SERVED'],
      SERVED: ['PAID'],
      PAID: ['CLOSED'],
      CLOSED: [],
      VOIDED: [],
      CANCELLED: [],
    };

    if (order.status !== status) {
      if (!validTransitions[order.status]?.includes(status)) {
        throw new Error('INVALID_STATE_TRANSITION');
      }
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        version: { increment: 1 },
        updatedBy: userId,
      },
    });
  }

  /**
   * Add item to order (Snapshots price from Menu Item)
   */
  static async addItemToOrder(
    tenantId: string,
    orderId: string,
    data: {
      menuItemId: string;
      quantity: number;
      notes?: string;
      modifierSelections: { modifierOptionId: string }[];
    },
    userId?: string,
  ) {
    // 1. Fetch live menu item price
    const menuItem = await prisma.menuItem.findFirst({
      where: { id: data.menuItemId, tenantId, isDeleted: false },
    });
    if (!menuItem) throw new Error('MENU_ITEM_NOT_FOUND');

    // 2. Fetch live modifier option prices
    let modifierTotal = 0;
    const modifierSnapshots: Prisma.OrderItemModifierSelectionCreateWithoutOrderItemInput[] = [];
    if (data.modifierSelections.length > 0) {
      const optionIds = data.modifierSelections.map((m) => m.modifierOptionId);
      const options = await prisma.modifierOption.findMany({
        where: { id: { in: optionIds }, tenantId, isDeleted: false },
      });

      for (const opt of options) {
        modifierTotal += Number(opt.priceDelta);
        modifierSnapshots.push({
          tenantId,
          modifierOptionId: opt.id,
          priceDeltaSnapshot: opt.priceDelta,
        });
      }
    }

    // 3. Fetch active Recipe and RecipeIngredients for snapshotting
    const recipe = await prisma.recipe.findFirst({
      where: { menuItemId: data.menuItemId, tenantId, isDeleted: false },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const recipeSnapshots: Prisma.OrderItemRecipeSnapshotCreateWithoutOrderItemInput[] = [];
    if (recipe) {
      for (const ri of recipe.recipeIngredients) {
        recipeSnapshots.push({
          recipeId: recipe.id,
          recipeName: recipe.name,
          ingredientId: ri.ingredientId,
          ingredientName: ri.ingredient.name,
          quantity: ri.quantity,
          unit: ri.unit,
          yieldLossPct: ri.yieldLossPct,
          spoilagePct: ri.spoilagePct,
        });
      }
    }

    // 4. Calculate snapshot totals
    const unitPrice = Number(menuItem.price) + modifierTotal;
    const totalPrice = unitPrice * data.quantity;

    // 5. Create OrderItem and Modifiers in a transaction
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, tenantId, isDeleted: false },
      });
      if (!order) throw new Error('ORDER_NOT_FOUND');

      const item = await tx.orderItem.create({
        data: {
          tenantId,
          orderId,
          menuItemId: data.menuItemId,
          quantity: data.quantity,
          notes: data.notes,
          unitPrice,
          taxRate: menuItem.taxRate,
          totalPrice,
          createdBy: userId,
          orderItemModifierSelections: {
            create: modifierSnapshots,
          },
          orderItemRecipeSnapshots: {
            create: recipeSnapshots,
          },
        },
      });

      // Update order totals and bump version
      const newSubtotal = Number(order.subtotal) + totalPrice;
      const newTax = Number(order.taxAmount) + totalPrice * Number(menuItem.taxRate);
      const newTotal = newSubtotal + newTax;

      await tx.order.update({
        where: { id: orderId },
        data: {
          subtotal: newSubtotal,
          taxAmount: newTax,
          totalAmount: newTotal,
          version: { increment: 1 },
          updatedBy: userId,
        },
      });

      return item;
    });
  }
}
