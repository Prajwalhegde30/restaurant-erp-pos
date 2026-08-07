import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class ModifierOptionService {
  static async create(tenantId: string, data: Prisma.ModifierOptionUncheckedCreateInput) {
    return await prisma.modifierOption.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findMany(tenantId: string, modifierGroupId?: string) {
    return await prisma.modifierOption.findMany({
      where: {
        tenantId,
        isDeleted: false,
        ...(modifierGroupId ? { modifierGroupId } : {}),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.modifierOption.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.ModifierOptionUpdateInput) {
    return await prisma.modifierOption.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.modifierOption.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
