import { Router } from 'express';
import { OrderController } from './order.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/', requirePermission('orders.manage.create'), OrderController.create);
router.get('/', requirePermission('orders.manage.read'), OrderController.getAll);
router.get('/:id', requirePermission('orders.manage.read'), OrderController.getById);
router.put('/:id/status', requirePermission('orders.manage.update'), OrderController.updateStatus);
router.post('/:id/items', requirePermission('orders.manage.update'), OrderController.addItem);

export { router as orderRouter };
