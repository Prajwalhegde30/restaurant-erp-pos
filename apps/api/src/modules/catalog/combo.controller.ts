import { Response, NextFunction } from 'express';
import { ComboService } from './combo.service';
import { AuthRequest } from '@repo/auth';
import { ComboSchema } from '@repo/types';

const CreateComboDto = ComboSchema.pick({
  name: true,
  description: true,
  price: true,
  taxRate: true,
  status: true,
});

const UpdateComboDto = CreateComboDto.partial();

export class ComboController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateComboDto.parse(req.body);
      const combo = await ComboService.create(tenantId, data);
      res.status(201).json(combo);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const combos = await ComboService.findMany(tenantId);
      res.status(200).json({ data: combos, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const combo = await ComboService.findById(tenantId, req.params.id);
      if (!combo) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(combo);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateComboDto.parse(req.body);
      await ComboService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await ComboService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
