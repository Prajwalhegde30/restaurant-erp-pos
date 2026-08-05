import { Router } from 'express';
import { MenuController } from './menu.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('menus.manage.create'), MenuController.create);
router.get('/', requirePermission('menus.manage.read'), MenuController.getAll);
router.get('/:id', requirePermission('menus.manage.read'), MenuController.getById);
router.put('/:id', requirePermission('menus.manage.update'), MenuController.update);
router.delete('/:id', requirePermission('menus.manage.delete'), MenuController.delete);

export { router as menuRouter };
