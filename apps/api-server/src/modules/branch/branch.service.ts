import { prisma } from '@repo/database';

export class BranchService {
  /**
   * Create a new Branch
   */
  static async createBranch(tenantId: string, data: Record<string, unknown>) {
    return await prisma.branch.create({
      data: {
        ...data,
        tenant_id: tenantId,
      },
    });
  }

  /**
   * Get all branches for a tenant
   */
  static async getBranches(tenantId: string) {
    return await prisma.branch.findMany({
      where: {
        tenant_id: tenantId,
        is_deleted: false,
      },
    });
  }

  /**
   * Get a single branch by ID
   */
  static async getBranchById(tenantId: string, branchId: string) {
    return await prisma.branch.findFirst({
      where: {
        id: branchId,
        tenant_id: tenantId,
        is_deleted: false,
      },
    });
  }

  /**
   * Update a branch
   */
  static async updateBranch(tenantId: string, branchId: string, data: Record<string, unknown>) {
    return await prisma.branch.updateMany({
      where: {
        id: branchId,
        tenant_id: tenantId,
      },
      data,
    });
  }

  /**
   * Delete (Soft delete) a branch
   */
  static async deleteBranch(tenantId: string, branchId: string) {
    return await prisma.branch.updateMany({
      where: {
        id: branchId,
        tenant_id: tenantId,
      },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
  }
}
