import { Response, NextFunction } from 'express';
import { StaffService } from './staff.service';
import { AuthRequest } from '@repo/auth';
import { UserSchema, UserRoleSchema, BranchAssignmentSchema } from '@repo/types';

const CreateUserDto = UserSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  isDeleted: true,
  deletedAt: true,
});

const UpdateUserDto = CreateUserDto.partial();

const AssignRoleDto = UserRoleSchema.pick({
  roleId: true,
  branchId: true,
});

const AssignBranchDto = BranchAssignmentSchema.pick({
  branchId: true,
});

export class StaffController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateUserDto.parse(req.body);
      const user = await StaffService.createUser(tenantId, data);

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const users = await StaffService.getUsers(tenantId);

      res.status(200).json({
        data: users,
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

      const user = await StaffService.getUserById(tenantId, req.params.id);

      if (!user) {
        return res.status(404).json({ error: { message: 'User not found' } });
      }

      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateUserDto.parse(req.body);
      await StaffService.updateUser(tenantId, req.params.id, data);

      const user = await StaffService.getUserById(tenantId, req.params.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await StaffService.deleteUser(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // User Roles
  static async assignRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = AssignRoleDto.parse(req.body);
      const assignment = await StaffService.assignRole(
        tenantId,
        req.params.id,
        data.roleId,
        data.branchId,
      );

      res.status(201).json(assignment);
    } catch (err) {
      next(err);
    }
  }

  static async getUserRoles(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const roles = await StaffService.getUserRoles(tenantId, req.params.id);

      res.status(200).json({
        data: roles,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async revokeRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await StaffService.revokeRole(tenantId, req.params.roleAssignmentId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  // Branch Assignments
  static async assignBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = AssignBranchDto.parse(req.body);
      const assignment = await StaffService.assignBranch(tenantId, req.params.id, data.branchId);

      res.status(201).json(assignment);
    } catch (err) {
      next(err);
    }
  }

  static async getBranchAssignments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const assignments = await StaffService.getBranchAssignments(tenantId, req.params.id);

      res.status(200).json({
        data: assignments,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async revokeBranch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await StaffService.revokeBranch(tenantId, req.params.branchAssignmentId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
