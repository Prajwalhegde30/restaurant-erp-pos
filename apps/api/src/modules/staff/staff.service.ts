import { prisma } from '@repo/database';

export class StaffService {
  /**
   * Create a new Staff User
   */
  static async createUser(
    tenantId: string,
    data: { email: string; firstName: string; lastName: string; pin?: string | null },
  ) {
    return await prisma.user.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  /**
   * Get all staff for a tenant
   */
  static async getUsers(tenantId: string) {
    return await prisma.user.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
    });
  }

  /**
   * Get a single staff by ID
   */
  static async getUserById(tenantId: string, userId: string) {
    return await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
        isDeleted: false,
      },
    });
  }

  /**
   * Update a staff user
   */
  static async updateUser(
    tenantId: string,
    userId: string,
    data: { email?: string; firstName?: string; lastName?: string; pin?: string | null },
  ) {
    return await prisma.user.updateMany({
      where: {
        id: userId,
        tenantId,
      },
      data,
    });
  }

  /**
   * Delete (Soft delete) a staff user
   */
  static async deleteUser(tenantId: string, userId: string) {
    return await prisma.user.updateMany({
      where: {
        id: userId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Assign a role to a user
   */
  static async assignRole(
    tenantId: string,
    userId: string,
    roleId: string,
    branchId?: string | null,
  ) {
    return await prisma.userRole.create({
      data: {
        tenantId,
        userId,
        roleId,
        branchId,
      },
    });
  }

  /**
   * Revoke a role from a user (Soft delete)
   */
  static async revokeRole(tenantId: string, userRoleId: string) {
    return await prisma.userRole.updateMany({
      where: {
        id: userRoleId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get roles assigned to a user
   */
  static async getUserRoles(tenantId: string, userId: string) {
    return await prisma.userRole.findMany({
      where: {
        tenantId,
        userId,
        isDeleted: false,
      },
    });
  }

  /**
   * Assign a user to a branch
   */
  static async assignBranch(tenantId: string, userId: string, branchId: string) {
    return await prisma.branchAssignment.create({
      data: {
        tenantId,
        userId,
        branchId,
      },
    });
  }

  /**
   * Revoke a branch assignment (Soft delete)
   */
  static async revokeBranch(tenantId: string, assignmentId: string) {
    return await prisma.branchAssignment.updateMany({
      where: {
        id: assignmentId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get branch assignments for a user
   */
  static async getBranchAssignments(tenantId: string, userId: string) {
    return await prisma.branchAssignment.findMany({
      where: {
        tenantId,
        userId,
        isDeleted: false,
      },
    });
  }
}
