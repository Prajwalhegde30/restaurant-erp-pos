import { Router } from 'express';
import { ModifierGroupController } from './modifier-group.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('modifiers.manage.create'), ModifierGroupController.create);
router.get('/', requirePermission('modifiers.manage.read'), ModifierGroupController.getAll);
router.get('/:id', requirePermission('modifiers.manage.read'), ModifierGroupController.getById);
router.put('/:id', requirePermission('modifiers.manage.update'), ModifierGroupController.update);
router.delete('/:id', requirePermission('modifiers.manage.delete'), ModifierGroupController.delete);

export { router as modifierGroupRouter };
