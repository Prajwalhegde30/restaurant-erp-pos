import { Router } from 'express';
import { IngredientController } from './ingredient.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/', requirePermission('inventory.ingredient.create'), IngredientController.create);
router.get('/', requirePermission('inventory.ingredient.read'), IngredientController.getAll);
router.get('/:id', requirePermission('inventory.ingredient.read'), IngredientController.getById);
router.put('/:id', requirePermission('inventory.ingredient.update'), IngredientController.update);
router.delete(
  '/:id',
  requirePermission('inventory.ingredient.delete'),
  IngredientController.delete,
);

export { router as ingredientRouter };
