import { Router } from 'express';
import { ComboController } from './combo.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('combos.manage.create'), ComboController.create);
router.get('/', requirePermission('combos.manage.read'), ComboController.getAll);
router.get('/:id', requirePermission('combos.manage.read'), ComboController.getById);
router.put('/:id', requirePermission('combos.manage.update'), ComboController.update);
router.delete('/:id', requirePermission('combos.manage.delete'), ComboController.delete);

export { router as comboRouter };
