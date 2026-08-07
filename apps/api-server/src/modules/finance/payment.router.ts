import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { requireAuth } from '@repo/auth';
import { requirePermission } from '../../middleware/rbac.middleware';
import { idempotencyMiddleware } from '../../middleware/idempotency.middleware';

const router = Router();

// Only authenticated endpoints
router.use(requireAuth);

router.post(
  '/',
  requirePermission('payments.manage.create'),
  idempotencyMiddleware,
  PaymentController.processPayment,
);

router.get('/', requirePermission('payments.manage.view'), PaymentController.getPayments);

router.get('/:id', requirePermission('payments.manage.view'), PaymentController.getPaymentById);

export { router as paymentRouter };
