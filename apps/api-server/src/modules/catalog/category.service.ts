import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class CategoryService {
  static async create(tenantId: string, data: Prisma.CategoryUncheckedCreateInput) {
    return await prisma.category.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findMany(tenantId: string, menuId?: string) {
    return await prisma.category.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(menuId ? { menuId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.category.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.CategoryUpdateInput) {
    return await prisma.category.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.category.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
