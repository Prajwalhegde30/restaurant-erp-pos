import { Router } from 'express';
import { DailyClosingController } from './daily-closing.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Note: Requires high-level permissions to manage business days
router.post('/open', requirePermission('dailyClosings.manage.create'), DailyClosingController.open);
router.post(
  '/:id/close',
  requirePermission('dailyClosings.manage.update'),
  DailyClosingController.close,
);

export { router as dailyClosingRouter };
