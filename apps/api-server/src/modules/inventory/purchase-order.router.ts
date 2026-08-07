import { Router } from 'express';
import { PurchaseOrderController } from './purchase-order.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.post(
  '/',
  requirePermission('inventory.po.create'),
  PurchaseOrderController.createPurchaseOrder,
);

router.get('/', requirePermission('inventory.po.read'), PurchaseOrderController.getPurchaseOrders);

router.get(
  '/:id',
  requirePermission('inventory.po.read'),
  PurchaseOrderController.getPurchaseOrderById,
);

router.put(
  '/:id/status',
  requirePermission('inventory.po.update'),
  PurchaseOrderController.updatePurchaseOrderStatus,
);

export { router as purchaseOrderRouter };
