import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// Auditor role or tenant read. We use the tenant-level or specific export permissions documented.
// E.g. 'audit_logs.export' or just a read equivalent. For viewing, let's use a general approach based on docs.
router.get('/', requirePermission('audit_logs.view'), AuditController.getLogs);

export { router as auditRouter };
