import { prisma } from '@repo/database';
import { InventoryItemSchema } from '@repo/types';
import { z } from 'zod';

type CreateInventoryItemDtoType = Omit<
  z.infer<typeof InventoryItemSchema>,
  | 'id'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
  | 'version'
>;
type UpdateInventoryItemDtoType = Partial<CreateInventoryItemDtoType>;

export class InventoryItemService {
  static async createInventoryItem(tenantId: string, data: CreateInventoryItemDtoType) {
    return prisma.inventoryItem.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async getInventoryItems(tenantId: string, branchId?: string) {
    return prisma.inventoryItem.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        isDeleted: false,
      },
      include: {
        ingredient: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async getInventoryItemById(tenantId: string, id: string) {
    return prisma.inventoryItem.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      include: {
        ingredient: true,
      },
    });
  }

  static async updateInventoryItem(tenantId: string, id: string, data: UpdateInventoryItemDtoType) {
    return prisma.inventoryItem.updateMany({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      data,
    });
  }

  static async deleteInventoryItem(tenantId: string, id: string) {
    return prisma.inventoryItem.updateMany({
      where: {
        id,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
