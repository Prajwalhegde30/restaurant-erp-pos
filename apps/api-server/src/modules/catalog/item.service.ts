import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class ItemService {
  static async create(tenantId: string, data: Prisma.MenuItemUncheckedCreateInput) {
    return await prisma.menuItem.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findMany(tenantId: string, categoryId?: string) {
    return await prisma.menuItem.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.menuItem.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.MenuItemUpdateInput) {
    return await prisma.menuItem.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.menuItem.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
