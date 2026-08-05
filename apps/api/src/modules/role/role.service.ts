import { prisma, PermissionScope } from '@repo/database';

export class RoleService {
  /**
   * Create a new Role
   */
  static async createRole(tenantId: string, data: { name: string; parentId?: string | null }) {
    return await prisma.role.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  /**
   * Get all roles for a tenant
   */
  static async getRoles(tenantId: string) {
    return await prisma.role.findMany({
      where: {
        tenantId,
        isDeleted: false,
      },
      include: {
        permissions: {
          where: { isDeleted: false },
        },
      },
    });
  }

  /**
   * Get a single role by ID
   */
  static async getRoleById(tenantId: string, roleId: string) {
    return await prisma.role.findFirst({
      where: {
        id: roleId,
        tenantId,
        isDeleted: false,
      },
      include: {
        permissions: {
          where: { isDeleted: false },
        },
      },
    });
  }

  /**
   * Update a role
   */
  static async updateRole(
    tenantId: string,
    roleId: string,
    data: { name?: string; parentId?: string | null },
  ) {
    return await prisma.role.updateMany({
      where: {
        id: roleId,
        tenantId,
      },
      data,
    });
  }

  /**
   * Delete (Soft delete) a role
   */
  static async deleteRole(tenantId: string, roleId: string) {
    return await prisma.role.updateMany({
      where: {
        id: roleId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Assign a permission to a role
   */
  static async assignPermission(
    tenantId: string,
    roleId: string,
    data: { module: string; resource: string; action: string; isDeny: boolean; scope: string },
  ) {
    return await prisma.permission.create({
      data: {
        ...data,
        tenantId,
        roleId,
        scope: data.scope.toUpperCase() as PermissionScope,
      },
    });
  }

  /**
   * Revoke a permission from a role (Soft delete)
   */
  static async revokePermission(tenantId: string, permissionId: string) {
    return await prisma.permission.updateMany({
      where: {
        id: permissionId,
        tenantId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
}
