import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { requireAuth } from '@repo/auth';
import { idempotencyMiddleware } from '../../middleware/idempotency.middleware';

const router = Router();

// Only authenticated endpoints
router.use(requireAuth);

router.post('/', idempotencyMiddleware, PaymentController.processPayment);

export { router as paymentRouter };
