import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// Reports
router.get(
  '/pmix',
  requirePermission('financial_reports.view.tenant'), // Alternatively, dynamic checks for .branch
  AnalyticsController.getPmixReport,
);

router.get(
  '/labor-to-sales',
  requirePermission('financial_reports.view.tenant'),
  AnalyticsController.getLaborToSalesReport,
);

export { router as analyticsRouter };
