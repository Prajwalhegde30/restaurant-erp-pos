import { Response, NextFunction } from 'express';
import { ModifierOptionService } from './modifier-option.service';
import { AuthRequest } from '@repo/auth';
import { ModifierOptionSchema } from '@repo/types';

const CreateModifierOptionDto = ModifierOptionSchema.pick({
  modifierGroupId: true,
  name: true,
  priceDelta: true,
  sortOrder: true,
});

const UpdateModifierOptionDto = CreateModifierOptionDto.partial();

export class ModifierOptionController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateModifierOptionDto.parse(req.body);
      const option = await ModifierOptionService.create(tenantId, data);
      res.status(201).json(option);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const modifierGroupId = req.query.modifierGroupId as string | undefined;

      const options = await ModifierOptionService.findMany(tenantId, modifierGroupId);
      res.status(200).json({ data: options, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const option = await ModifierOptionService.findById(tenantId, req.params.id);
      if (!option) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(option);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateModifierOptionDto.parse(req.body);
      await ModifierOptionService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await ModifierOptionService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
