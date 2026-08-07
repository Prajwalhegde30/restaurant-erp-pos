import { Response, NextFunction } from 'express';
import { RoleService } from './role.service';
import { AuthRequest } from '@repo/auth';
import { RoleSchema, PermissionSchema } from '@repo/types';

const CreateRoleDto = RoleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  isDeleted: true,
  deletedAt: true,
});

const UpdateRoleDto = CreateRoleDto.partial();

const CreatePermissionDto = PermissionSchema.pick({
  module: true,
  resource: true,
  action: true,
  isDeny: true,
  scope: true,
});

export class RoleController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateRoleDto.parse(req.body);
      const role = await RoleService.createRole(tenantId, data);

      res.status(201).json(role);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const roles = await RoleService.getRoles(tenantId);

      res.status(200).json({
        data: roles,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const role = await RoleService.getRoleById(tenantId, req.params.id);

      if (!role) {
        return res.status(404).json({ error: { message: 'Role not found' } });
      }

      res.status(200).json(role);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateRoleDto.parse(req.body);
      await RoleService.updateRole(tenantId, req.params.id, data);

      const role = await RoleService.getRoleById(tenantId, req.params.id);
      res.status(200).json(role);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await RoleService.deleteRole(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Permissions
  static async assignPermission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreatePermissionDto.parse(req.body);
      const permission = await RoleService.assignPermission(tenantId, req.params.id, data);

      res.status(201).json(permission);
    } catch (err) {
      next(err);
    }
  }

  static async revokePermission(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await RoleService.revokePermission(tenantId, req.params.permissionId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
