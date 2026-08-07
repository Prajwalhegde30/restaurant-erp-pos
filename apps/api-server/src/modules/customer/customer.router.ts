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

// Loyalty
router.post(
  '/:id/loyalty/accrue',
  requirePermission('loyalty.manage'),
  CustomerController.accruePoints,
);
router.get(
  '/:id/loyalty/balance',
  requirePermission('customers.view'),
  CustomerController.getLoyaltyBalance,
);

// Coupons
router.post(
  '/:id/coupon/apply',
  requirePermission('coupons.manage'),
  CustomerController.applyCoupon,
);

export { router as customerRouter };
