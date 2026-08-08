import { Response, NextFunction } from 'express';
import { MenuService } from './menu.service';
import { AuthRequest } from '@repo/auth';
import { MenuSchema } from '@repo/types';

const CreateMenuDto = MenuSchema.pick({
  name: true,
  description: true,
  status: true,
});

const UpdateMenuDto = CreateMenuDto.partial();

export class MenuController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateMenuDto.parse(req.body);
      const menu = await MenuService.create(tenantId, { ...data, tenantId } as never);
      res.status(201).json(menu);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const menus = await MenuService.findMany(tenantId);
      res.status(200).json({ data: menus, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const menu = await MenuService.findById(tenantId, req.params.id);
      if (!menu) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(menu);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateMenuDto.parse(req.body);
      await MenuService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await MenuService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
