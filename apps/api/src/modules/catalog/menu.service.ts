import { prisma } from '@repo/database';
import { Prisma } from '@repo/database';

export class MenuService {
  static async create(tenantId: string, data: Prisma.MenuCreateInput) {
    return await prisma.menu.create({
      data: {
        ...data,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  static async findMany(tenantId: string) {
    return await prisma.menu.findMany({
      where: { tenantId, isDeleted: false },
    });
  }

  static async findById(tenantId: string, id: string) {
    return await prisma.menu.findFirst({
      where: { id, tenantId, isDeleted: false },
    });
  }

  static async update(tenantId: string, id: string, data: Prisma.MenuUpdateInput) {
    return await prisma.menu.updateMany({
      where: { id, tenantId, isDeleted: false },
      data,
    });
  }

  static async delete(tenantId: string, id: string) {
    return await prisma.menu.updateMany({
      where: { id, tenantId, isDeleted: false },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  }
}
