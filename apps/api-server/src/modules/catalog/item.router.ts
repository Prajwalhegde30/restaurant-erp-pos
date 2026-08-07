import { Router } from 'express';
import { ItemController } from './item.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('items.manage.create'), ItemController.create);
router.get('/', requirePermission('items.manage.read'), ItemController.getAll);
router.get('/:id', requirePermission('items.manage.read'), ItemController.getById);
router.put('/:id', requirePermission('items.manage.update'), ItemController.update);
router.delete('/:id', requirePermission('items.manage.delete'), ItemController.delete);

export { router as itemRouter };
