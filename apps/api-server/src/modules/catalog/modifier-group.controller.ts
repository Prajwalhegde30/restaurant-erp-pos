import { Response, NextFunction } from 'express';
import { ModifierGroupService } from './modifier-group.service';
import { AuthRequest } from '@repo/auth';
import { ModifierGroupSchema } from '@repo/types';

const CreateModifierGroupDto = ModifierGroupSchema.pick({
  name: true,
  minSelections: true,
  maxSelections: true,
  isRequired: true,
});

const UpdateModifierGroupDto = CreateModifierGroupDto.partial();

export class ModifierGroupController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateModifierGroupDto.parse(req.body);
      const group = await ModifierGroupService.create(tenantId, { ...data, tenantId } as never);
      res.status(201).json(group);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const groups = await ModifierGroupService.findMany(tenantId);
      res.status(200).json({ data: groups, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const group = await ModifierGroupService.findById(tenantId, req.params.id);
      if (!group) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(group);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateModifierGroupDto.parse(req.body);
      await ModifierGroupService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await ModifierGroupService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
