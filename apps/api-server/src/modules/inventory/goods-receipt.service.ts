import { prisma } from '@repo/database';
import { GoodsReceiptSchema, GoodsReceiptItemSchema } from '@repo/types';
import { z } from 'zod';

type CreateGoodsReceiptDtoType = Omit<
  z.infer<typeof GoodsReceiptSchema>,
  | 'id'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
  | 'status'
  | 'receivedAt'
>;

type GoodsReceiptItemDtoType = Omit<
  z.infer<typeof GoodsReceiptItemSchema>,
  | 'id'
  | 'tenantId'
  | 'goodsReceiptId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
>;

export class GoodsReceiptService {
  static async createGoodsReceipt(
    tenantId: string,
    data: CreateGoodsReceiptDtoType,
    items: GoodsReceiptItemDtoType[],
  ) {
    // Validate PO exists and is approved or partially received
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        id: data.purchaseOrderId,
        tenantId,
        isDeleted: false,
      },
    });

    if (!po) throw new Error('Purchase Order not found');
    if (po.status !== 'APPROVED' && po.status !== 'PARTIALLY_RECEIVED') {
      throw new Error('Purchase Order is not in a receivable state');
    }

    return prisma.goodsReceipt.create({
      data: {
        ...data,
        tenantId,
        status: 'PENDING',
        goodsReceiptItems: {
          create: items.map((item) => ({
            ...item,
            tenantId,
          })),
        },
      },
      include: {
        goodsReceiptItems: true,
      },
    });
  }

  static async getGoodsReceipts(tenantId: string, branchId?: string) {
    return prisma.goodsReceipt.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        isDeleted: false,
      },
      include: {
        purchaseOrder: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getGoodsReceiptById(tenantId: string, id: string) {
    return prisma.goodsReceipt.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      include: {
        goodsReceiptItems: {
          where: { isDeleted: false },
          include: {
            ingredient: true,
          },
        },
        purchaseOrder: true,
      },
    });
  }

  static async completeGoodsReceipt(tenantId: string, id: string) {
    return prisma.$transaction(async (tx) => {
      const grn = await tx.goodsReceipt.findFirst({
        where: { id, tenantId, isDeleted: false },
        include: { goodsReceiptItems: { where: { isDeleted: false } } },
      });

      if (!grn) throw new Error('Goods Receipt not found');
      if (grn.status !== 'PENDING') throw new Error('Goods Receipt is already processed');

      const po = await tx.purchaseOrder.findFirst({
        where: { id: grn.purchaseOrderId, tenantId, isDeleted: false },
        include: { purchaseOrderItems: { where: { isDeleted: false } } },
      });

      if (!po) throw new Error('Purchase Order not found');

      // Update GRN status
      await tx.goodsReceipt.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      // Process each received item
      for (const item of grn.goodsReceiptItems) {
        if (Number(item.acceptedQty) > 0) {
          // 1. Create InventoryBatch
          const batchNumber = `BATCH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          await tx.inventoryBatch.create({
            data: {
              tenantId,
              branchId: grn.branchId,
              ingredientId: item.ingredientId,
              batchNumber,
              receivedQty: item.acceptedQty,
              remainingQty: item.acceptedQty,
              unitCost: item.unitCost,
            },
          });

          // 2. Append to StockMovement ledger
          await tx.stockMovement.create({
            data: {
              tenantId,
              branchId: grn.branchId,
              ingredientId: item.ingredientId,
              movementType: 'PURCHASE',
              quantityDelta: item.acceptedQty,
              unitCost: item.unitCost,
              referenceId: grn.id,
              referenceType: 'GoodsReceipt',
              notes: `Received via GRN ${grn.grnNumber}`,
            },
          });

          // 3. Upsert InventoryItem (actualQty)
          const existingItem = await tx.inventoryItem.findFirst({
            where: {
              tenantId,
              branchId: grn.branchId,
              ingredientId: item.ingredientId,
              isDeleted: false,
            },
          });

          if (existingItem) {
            await tx.inventoryItem.update({
              where: { id: existingItem.id },
              data: {
                actualQty: {
                  increment: item.acceptedQty,
                },
                version: {
                  increment: 1,
                },
              },
            });
          } else {
            await tx.inventoryItem.create({
              data: {
                tenantId,
                branchId: grn.branchId,
                ingredientId: item.ingredientId,
                actualQty: item.acceptedQty,
                theoreticalQty: 0,
                version: 1,
              },
            });
          }
        }
      }

      // Check if PO is fully received
      let fullyReceived = true;
      // Get all completed GRNs for this PO to calculate total received
      const allCompletedGrns = await tx.goodsReceipt.findMany({
        where: { purchaseOrderId: po.id, status: 'COMPLETED', isDeleted: false },
        include: { goodsReceiptItems: { where: { isDeleted: false } } },
      });

      const totalAcceptedPerIngredient: Record<string, number> = {};
      for (const compGrn of allCompletedGrns) {
        for (const item of compGrn.goodsReceiptItems) {
          totalAcceptedPerIngredient[item.ingredientId] =
            (totalAcceptedPerIngredient[item.ingredientId] || 0) + Number(item.acceptedQty);
        }
      }

      for (const poItem of po.purchaseOrderItems) {
        const received = totalAcceptedPerIngredient[poItem.ingredientId] || 0;
        if (received < Number(poItem.orderedQty)) {
          fullyReceived = false;
          break;
        }
      }

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: {
          status: fullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
        },
      });

      return { success: true, fullyReceived };
    });
  }
}
