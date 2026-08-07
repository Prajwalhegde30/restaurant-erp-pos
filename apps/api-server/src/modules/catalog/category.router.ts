import { Router } from 'express';
import { CategoryController } from './category.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('categories.manage.create'), CategoryController.create);
router.get('/', requirePermission('categories.manage.read'), CategoryController.getAll);
router.get('/:id', requirePermission('categories.manage.read'), CategoryController.getById);
router.put('/:id', requirePermission('categories.manage.update'), CategoryController.update);
router.delete('/:id', requirePermission('categories.manage.delete'), CategoryController.delete);

export { router as categoryRouter };
