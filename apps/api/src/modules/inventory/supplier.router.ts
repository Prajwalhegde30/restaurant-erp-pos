import { Router } from 'express';
import { SupplierController } from './supplier.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.post('/', requirePermission('inventory.supplier.create'), SupplierController.create);
router.get('/', requirePermission('inventory.supplier.read'), SupplierController.getAll);
router.get('/:id', requirePermission('inventory.supplier.read'), SupplierController.getById);
router.put('/:id', requirePermission('inventory.supplier.update'), SupplierController.update);
router.delete('/:id', requirePermission('inventory.supplier.delete'), SupplierController.delete);

export { router as supplierRouter };
