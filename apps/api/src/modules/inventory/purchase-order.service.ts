import { prisma } from '@repo/database';
import { PurchaseOrderSchema, PurchaseOrderItemSchema } from '@repo/types';
import { z } from 'zod';

type CreatePurchaseOrderDtoType = Omit<
  z.infer<typeof PurchaseOrderSchema>,
  | 'id'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
  | 'status'
  | 'total'
  | 'subtotal'
  | 'taxAmount'
>;

type PurchaseOrderItemDtoType = Omit<
  z.infer<typeof PurchaseOrderItemSchema>,
  | 'id'
  | 'tenantId'
  | 'purchaseOrderId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
>;

export class PurchaseOrderService {
  static async createPurchaseOrder(
    tenantId: string,
    data: CreatePurchaseOrderDtoType,
    items: PurchaseOrderItemDtoType[],
  ) {
    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.totalCost);
    }
    // Simplistic tax logic for now, could be passed or fetched.
    const taxAmount = 0;
    const total = subtotal + taxAmount;

    return prisma.purchaseOrder.create({
      data: {
        ...data,
        tenantId,
        status: 'DRAFT',
        subtotal,
        taxAmount,
        total,
        purchaseOrderItems: {
          create: items.map((item) => ({
            ...item,
            tenantId,
          })),
        },
      },
      include: {
        purchaseOrderItems: true,
      },
    });
  }

  static async getPurchaseOrders(tenantId: string, branchId?: string) {
    return prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        isDeleted: false,
      },
      include: {
        supplier: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getPurchaseOrderById(tenantId: string, id: string) {
    return prisma.purchaseOrder.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      include: {
        supplier: true,
        purchaseOrderItems: {
          where: { isDeleted: false },
          include: {
            ingredient: true,
          },
        },
        goodsReceipts: {
          where: { isDeleted: false },
        },
      },
    });
  }

  static async updatePurchaseOrderStatus(
    tenantId: string,
    id: string,
    status: 'SUBMITTED' | 'APPROVED' | 'CANCELLED',
  ) {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, tenantId, isDeleted: false },
    });

    if (!po) throw new Error('Purchase Order not found');

    if (po.status !== 'DRAFT' && status === 'SUBMITTED') {
      throw new Error('Only DRAFT Purchase Orders can be submitted');
    }
    if (po.status !== 'SUBMITTED' && status === 'APPROVED') {
      throw new Error('Only SUBMITTED Purchase Orders can be approved');
    }

    return prisma.purchaseOrder.update({
      where: {
        id,
      },
      data: {
        status,
        ...(status === 'SUBMITTED' ? { orderedAt: new Date() } : {}),
      },
    });
  }
}
