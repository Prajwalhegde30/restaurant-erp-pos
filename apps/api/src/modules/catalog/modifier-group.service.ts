import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class ModifierGroupService {
  static async create(tenantId: string, data: Prisma.ModifierGroupUncheckedCreateInput) {
    return await prisma.modifierGroup.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findMany(tenantId: string) {
    return await prisma.modifierGroup.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.modifierGroup.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.ModifierGroupUpdateInput) {
    return await prisma.modifierGroup.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.modifierGroup.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
