import { Response, NextFunction } from 'express';
import { CategoryService } from './category.service';
import { AuthRequest } from '@repo/auth';
import { CategorySchema } from '@repo/types';

const CreateCategoryDto = CategorySchema.pick({
  menuId: true,
  parentId: true,
  name: true,
  description: true,
  sortOrder: true,
  status: true,
});

const UpdateCategoryDto = CreateCategoryDto.partial();

export class CategoryController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateCategoryDto.parse(req.body);
      const category = await CategoryService.create(tenantId, data);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const menuId = req.query.menuId as string | undefined;

      const categories = await CategoryService.findMany(tenantId, menuId);
      res.status(200).json({ data: categories, has_more: false, next_cursor: null });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const category = await CategoryService.findById(tenantId, req.params.id);
      if (!category) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateCategoryDto.parse(req.body);
      await CategoryService.update(tenantId, req.params.id, data);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await CategoryService.delete(tenantId, req.params.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
