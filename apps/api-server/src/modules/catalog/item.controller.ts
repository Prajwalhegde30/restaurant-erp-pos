import { Response, NextFunction } from 'express';
import { ItemService } from './item.service';
import { AuthRequest } from '@repo/auth';
import { MenuItemSchema } from '@repo/types';

const CreateMenuItemDto = MenuItemSchema.pick({
  categoryId: true,
  name: true,
  description: true,
  price: true,
  taxRate: true,
  sortOrder: true,
  status: true,
});

const UpdateMenuItemDto = CreateMenuItemDto.partial();

export class ItemController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateMenuItemDto.parse(req.body);
      const item = await ItemService.create(tenantId, data);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const categoryId = req.query.categoryId as string | undefined;

      const items = await ItemService.findMany(tenantId, categoryId);
      res.status(200).json({ data: items, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const item = await ItemService.findById(tenantId, req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateMenuItemDto.parse(req.body);
      await ItemService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await ItemService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
