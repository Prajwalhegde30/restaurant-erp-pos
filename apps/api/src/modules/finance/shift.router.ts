import { Router } from 'express';
import { ShiftController } from './shift.controller';
import { requireAuth } from '@repo/auth';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(requireAuth);

router.post('/open', requirePermission('shifts.manage.create'), ShiftController.open);
router.post('/:id/close', requirePermission('shifts.manage.update'), ShiftController.close);

export { router as shiftRouter };
