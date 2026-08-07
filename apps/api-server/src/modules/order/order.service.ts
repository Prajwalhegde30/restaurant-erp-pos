import { prisma } from '@repo/database';
import { OrderStatus, OrderType, Prisma } from '@prisma/client';
import { eventBus } from '../../lib/eventBus';
import { randomUUID } from 'crypto';
import { DepletionProducer } from '../inventory/workers/depletion.producer';

export class OrderService {
  /**
   * Create order with items atomically
   */
  static async createOrderWithItems(
    tenantId: string,
    idempotencyKey: string,
    data: {
      branchId: string;
      diningTableId?: string;
      orderType?: OrderType;
      notes?: string;
      items?: {
        menuItemId: string;
        quantity: number;
        notes?: string;
        modifierSelections: { modifierOptionId: string }[];
      }[];
    },
    userId?: string,
  ) {
    const itemData = data.items || [];

    // 1. Pre-fetch menu items
    const menuItemIds = itemData.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId, isDeleted: false },
    });
    const menuItemsMap = new Map(menuItems.map((m) => [m.id, m]));

    // 2. Pre-fetch options
    const optionIds = itemData.flatMap((i) => i.modifierSelections.map((m) => m.modifierOptionId));
    const options = await prisma.modifierOption.findMany({
      where: { id: { in: optionIds }, tenantId, isDeleted: false },
    });
    const optionsMap = new Map(options.map((o) => [o.id, o]));

    // 3. Pre-fetch recipes
    const recipes = await prisma.recipe.findMany({
      where: { menuItemId: { in: menuItemIds }, tenantId, isDeleted: false },
      include: {
        recipeIngredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
    const recipeMap = new Map(recipes.map((r) => [r.menuItemId, r]));

    // Validate all items exist
    for (const item of itemData) {
      if (!menuItemsMap.has(item.menuItemId)) {
        throw new Error('MENU_ITEM_NOT_FOUND');
      }
    }

    const { finalOrder, createdItems } = await prisma.$transaction(async (tx) => {
      // 4. Create base order
      const order = await tx.order.create({
        data: {
          tenantId,
          idempotencyKey,
          branchId: data.branchId,
          diningTableId: data.diningTableId,
          orderType: data.orderType || 'DINE_IN',
          notes: data.notes,
          userId,
          status: 'PLACED', // POS orders start as PLACED or IN_PREP usually
        },
      });

      let subtotal = 0;
      let taxAmount = 0;
      const createdItems = [];

      // 5. Create items
      for (const item of itemData) {
        const menuItem = menuItemsMap.get(item.menuItemId)!;

        let modifierTotal = 0;
        const modifierSnapshots: Prisma.OrderItemModifierSelectionCreateWithoutOrderItemInput[] =
          [];

        for (const mod of item.modifierSelections) {
          const opt = optionsMap.get(mod.modifierOptionId);
          if (opt) {
            modifierTotal += Number(opt.priceDelta);
            modifierSnapshots.push({
              tenantId,
              modifierOption: { connect: { id: opt.id } },
              priceDeltaSnapshot: opt.priceDelta,
            });
          }
        }

        const recipeSnapshots: Prisma.OrderItemRecipeSnapshotCreateWithoutOrderItemInput[] = [];
        const recipe = recipeMap.get(item.menuItemId);
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

        const unitPrice = Number(menuItem.price) + modifierTotal;
        const totalPrice = unitPrice * item.quantity;

        const orderItem = await tx.orderItem.create({
          data: {
            tenantId,
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            notes: item.notes,
            unitPrice,
            taxRate: menuItem.taxRate,
            totalPrice,
            createdBy: userId,
            orderItemModifierSelections: { create: modifierSnapshots },
            orderItemRecipeSnapshots: { create: recipeSnapshots },
          },
          include: {
            orderItemModifierSelections: true,
          },
        });

        createdItems.push({ orderItem, menuItem });

        subtotal += totalPrice;
        taxAmount += totalPrice * Number(menuItem.taxRate);
      }

      const totalAmount = subtotal + taxAmount;

      const finalOrder = await tx.order.update({
        where: { id: order.id },
        data: { subtotal, taxAmount, totalAmount },
        include: {
          orderItems: {
            include: { orderItemModifierSelections: true },
          },
        },
      });

      return { finalOrder, createdItems };
    });

    // 6. Queue Depletion Jobs
    for (const { orderItem } of createdItems) {
      await DepletionProducer.queueDepletionJob({
        tenantId,
        branchId: data.branchId,
        orderItemId: orderItem.id,
      }).catch((err) => {
        console.error('Failed to queue depletion job:', err);
      });
    }

    // 7. Fire KDS Event
    eventBus
      .publish({
        eventId: randomUUID(),
        eventType: 'KitchenTicketCreated',
        timestamp: new Date().toISOString(),
        tenantId,
        branchId: data.branchId,
        payload: {
          id: finalOrder.id,
          orderNumber: finalOrder.id.slice(-6).toUpperCase(),
          status: finalOrder.status,
          type: finalOrder.orderType,
          table: data.diningTableId || 'N/A', // KDS expects a string
          waiter: userId || 'System',
          time: finalOrder.createdAt.toISOString(),
          items: createdItems.map(({ orderItem, menuItem }) => ({
            id: orderItem.id,
            name: menuItem.name,
            quantity: orderItem.quantity,
            modifiers: orderItem.orderItemModifierSelections.map((m) => m.modifierOptionId),
            notes: orderItem.notes || undefined,
          })),
        },
      })
      .catch((err) => {
        console.error('Failed to publish KitchenTicketCreated event:', err);
      });

    return finalOrder;
  }

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
      select: { version: true, status: true, branchId: true },
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

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        version: { increment: 1 },
        updatedBy: userId,
      },
    });

    // Fire event to Pub/Sub (EventBus)
    eventBus
      .publish({
        eventId: randomUUID(),
        eventType: 'OrderStatusUpdated',
        timestamp: new Date().toISOString(),
        tenantId,
        branchId: order.branchId,
        payload: {
          orderId,
          status,
        },
      })
      .catch((err) => {
        // We don't want to throw and rollback just because pubsub failed,
        // but we should log it for recovery.
        console.error('Failed to publish OrderStatusUpdated event:', err);
      });

    return updatedOrder;
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
          modifierOption: { connect: { id: opt.id } },
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
