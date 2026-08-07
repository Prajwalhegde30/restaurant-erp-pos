import { Router } from 'express';
import { ModifierOptionController } from './modifier-option.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('modifiers.manage.create'), ModifierOptionController.create);
router.get('/', requirePermission('modifiers.manage.read'), ModifierOptionController.getAll);
router.get('/:id', requirePermission('modifiers.manage.read'), ModifierOptionController.getById);
router.put('/:id', requirePermission('modifiers.manage.update'), ModifierOptionController.update);
router.delete(
  '/:id',
  requirePermission('modifiers.manage.delete'),
  ModifierOptionController.delete,
);

export { router as modifierOptionRouter };
