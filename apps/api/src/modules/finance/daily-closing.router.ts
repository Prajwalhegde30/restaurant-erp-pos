import { Router } from 'express';
import { DailyClosingController } from './daily-closing.controller';
import { requireAuth } from '@repo/auth';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth);

// Note: Requires high-level permissions to manage business days
router.post('/open', requirePermission('dailyClosings.manage.create'), DailyClosingController.open);
router.post(
  '/:id/close',
  requirePermission('dailyClosings.manage.update'),
  DailyClosingController.close,
);

export { router as dailyClosingRouter };
