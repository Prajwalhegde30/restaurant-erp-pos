import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// User CRUD
router.post('/', requirePermission('staff.manage.create'), StaffController.create);
router.get('/', requirePermission('staff.manage.read'), StaffController.getAll);
router.get('/:id', requirePermission('staff.manage.read'), StaffController.getById);
router.put('/:id', requirePermission('staff.manage.update'), StaffController.update);
router.delete('/:id', requirePermission('staff.manage.delete'), StaffController.delete);

// User Roles
router.post('/:id/roles', requirePermission('staff.manage.update'), StaffController.assignRole);
router.get('/:id/roles', requirePermission('staff.manage.read'), StaffController.getUserRoles);
router.delete(
  '/:id/roles/:roleAssignmentId',
  requirePermission('staff.manage.update'),
  StaffController.revokeRole,
);

// Branch Assignments
router.post(
  '/:id/branches',
  requirePermission('staff.manage.update'),
  StaffController.assignBranch,
);
router.get(
  '/:id/branches',
  requirePermission('staff.manage.read'),
  StaffController.getBranchAssignments,
);
router.delete(
  '/:id/branches/:branchAssignmentId',
  requirePermission('staff.manage.update'),
  StaffController.revokeBranch,
);

export { router as staffRouter };
