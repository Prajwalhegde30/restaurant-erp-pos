import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class ComboService {
  static async create(tenantId: string, data: Prisma.ComboUncheckedCreateInput) {
    return await prisma.combo.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async findMany(tenantId: string) {
    return await prisma.combo.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.combo.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.ComboUpdateInput) {
    return await prisma.combo.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.combo.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
