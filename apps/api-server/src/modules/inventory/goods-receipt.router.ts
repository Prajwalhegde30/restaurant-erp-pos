import { Router } from 'express';
import { GoodsReceiptController } from './goods-receipt.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.post(
  '/',
  requirePermission('inventory.grn.create'),
  GoodsReceiptController.createGoodsReceipt,
);

router.get('/', requirePermission('inventory.grn.read'), GoodsReceiptController.getGoodsReceipts);

router.get(
  '/:id',
  requirePermission('inventory.grn.read'),
  GoodsReceiptController.getGoodsReceiptById,
);

router.post(
  '/:id/complete',
  requirePermission('inventory.grn.update'),
  GoodsReceiptController.completeGoodsReceipt,
);

export { router as goodsReceiptRouter };
