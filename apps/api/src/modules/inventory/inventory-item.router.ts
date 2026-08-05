import { Router } from 'express';
import { InventoryItemController } from './inventory-item.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/', requirePermission('inventory.item.create'), InventoryItemController.create);
router.get('/', requirePermission('inventory.item.read'), InventoryItemController.getAll);
router.get('/:id', requirePermission('inventory.item.read'), InventoryItemController.getById);
router.put('/:id', requirePermission('inventory.item.update'), InventoryItemController.update);
router.delete('/:id', requirePermission('inventory.item.delete'), InventoryItemController.delete);

export { router as inventoryItemRouter };
