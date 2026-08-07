import {
  createRbacMiddleware,
  AuthRequest,
  RbacMatrix,
  PermissionScope,
  PermissionEffect,
  RoleDefinition,
} from '@repo/auth';
import { prisma } from '@repo/database';

async function getRbacMatrix(req: AuthRequest): Promise<RbacMatrix> {
  const tenantId = req.tenantId;
  const userId = req.user?.id;

  if (!tenantId || !userId) {
    return { roles: {}, userAssignments: [], userOverrides: [] };
  }

  // Fetch all roles and permissions for the tenant
  const dbRoles = await prisma.role.findMany({
    where: { tenantId, isDeleted: false },
    include: {
      permissions: {
        where: { isDeleted: false },
      },
    },
  });

  const roles: Record<string, RoleDefinition> = {};
  dbRoles.forEach((r) => {
    roles[r.id] = {
      id: r.id,
      name: r.name,
      tenantId: r.tenantId,
      parentRoleId: r.parentId,
      permissions: r.permissions.map((p) => ({
        permission: `${p.module}.${p.resource}.${p.action}`,
        effect: p.isDeny ? 'DENY' : ('ALLOW' as PermissionEffect),
        scope: p.scope.toLowerCase() as PermissionScope,
        effectiveFrom: p.effectiveFrom,
        effectiveUntil: p.effectiveUntil,
      })),
    };
  });

  // Fetch user role assignments
  const dbAssignments = await prisma.userRole.findMany({
    where: { tenantId, userId, isDeleted: false },
  });

  const userAssignments = dbAssignments.map((a) => ({
    userId: a.userId,
    roleId: a.roleId,
    tenantId: a.tenantId,
    branchId: a.branchId,
    effectiveFrom: a.effectiveFrom,
    effectiveUntil: a.effectiveUntil,
  }));

  return { roles, userAssignments, userOverrides: [] };
}

export const requirePermission = (permission: string) => {
  return createRbacMiddleware(permission, getRbacMatrix);
};
