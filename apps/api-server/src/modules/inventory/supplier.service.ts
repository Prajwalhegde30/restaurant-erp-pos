import { prisma } from '@repo/database';
import { SupplierSchema } from '@repo/types';
import { z } from 'zod';

type CreateSupplierDtoType = Omit<
  z.infer<typeof SupplierSchema>,
  | 'id'
  | 'tenantId'
  | 'createdAt'
  | 'updatedAt'
  | 'createdBy'
  | 'updatedBy'
  | 'isDeleted'
  | 'deletedAt'
>;
type UpdateSupplierDtoType = Partial<CreateSupplierDtoType>;

export class SupplierService {
  static async createSupplier(tenantId: string, data: CreateSupplierDtoType) {
    return prisma.supplier.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  static async getSuppliers(tenantId: string, branchId?: string) {
    return prisma.supplier.findMany({
      where: {
        tenantId,
        ...(branchId ? { branchId } : {}),
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  static async getSupplierById(tenantId: string, id: string) {
    return prisma.supplier.findFirst({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
    });
  }

  static async updateSupplier(tenantId: string, id: string, data: UpdateSupplierDtoType) {
    return prisma.supplier.updateMany({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
      data,
    });
  }

  static async deleteSupplier(tenantId: string, id: string) {
    return prisma.supplier.updateMany({
      where: {
        id,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: 'INACTIVE', // Safe cast or enum
      },
    });
  }
}
