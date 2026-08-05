import { Response, NextFunction } from 'express';
import { BranchService } from './branch.service';
import { BranchSchema } from '@repo/types';
import { AuthenticatedRequest } from '../../middleware/logger.middleware';

// We omit the fields that are generated or read-only from the create payload
const CreateBranchDto = BranchSchema.omit({
  id: true,
  tenant_id: true,
  created_at: true,
  updated_at: true,
  is_deleted: true,
  deleted_at: true,
});

const UpdateBranchDto = CreateBranchDto.partial();

export class BranchController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId; // from authMiddleware
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateBranchDto.parse(req.body);
      const branch = await BranchService.createBranch(tenantId, data);

      res.status(201).json(branch);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const branches = await BranchService.getBranches(tenantId);

      // API.md specifies paginated envelope for lists
      res.status(200).json({
        data: branches,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const branch = await BranchService.getBranchById(tenantId, req.params.id);

      if (!branch) {
        return res.status(404).json({ error: { message: 'Branch not found' } });
      }

      res.status(200).json(branch);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateBranchDto.parse(req.body);
      await BranchService.updateBranch(tenantId, req.params.id, data);

      const branch = await BranchService.getBranchById(tenantId, req.params.id);
      res.status(200).json(branch);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await BranchService.deleteBranch(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
