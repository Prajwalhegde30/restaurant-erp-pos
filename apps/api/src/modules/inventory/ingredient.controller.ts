import { Response, NextFunction } from 'express';
import { IngredientService } from './ingredient.service';
import { AuthRequest } from '@repo/auth';
import { IngredientSchema } from '@repo/types';

const CreateIngredientDto = IngredientSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  isDeleted: true,
  deletedAt: true,
});

const UpdateIngredientDto = CreateIngredientDto.partial();

export class IngredientController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateIngredientDto.parse(req.body);
      const ingredient = await IngredientService.createIngredient(tenantId, data);

      res.status(201).json(ingredient);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const ingredients = await IngredientService.getIngredients(tenantId);

      res.status(200).json({
        data: ingredients,
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

      const ingredient = await IngredientService.getIngredientById(tenantId, req.params.id);

      if (!ingredient) {
        return res.status(404).json({ error: { message: 'Ingredient not found' } });
      }

      res.status(200).json(ingredient);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateIngredientDto.parse(req.body);
      await IngredientService.updateIngredient(tenantId, req.params.id, data);

      const ingredient = await IngredientService.getIngredientById(tenantId, req.params.id);
      res.status(200).json(ingredient);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await IngredientService.deleteIngredient(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
