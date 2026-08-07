import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// Customer CRUD
router.post('/', requirePermission('customers.create'), CustomerController.create);
router.get('/', requirePermission('customers.view'), CustomerController.getAll);
router.get('/:id', requirePermission('customers.view'), CustomerController.getById);
router.put('/:id', requirePermission('customers.edit'), CustomerController.update);
router.delete('/:id', requirePermission('customers.delete'), CustomerController.delete);

export { router as customerRouter };
