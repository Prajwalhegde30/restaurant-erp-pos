import { Router } from 'express';
import { RoleController } from './role.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// Role CRUD
router.post('/', requirePermission('roles.manage.create'), RoleController.create);
router.get('/', requirePermission('roles.manage.read'), RoleController.getAll);
router.get('/:id', requirePermission('roles.manage.read'), RoleController.getById);
router.put('/:id', requirePermission('roles.manage.update'), RoleController.update);
router.delete('/:id', requirePermission('roles.manage.delete'), RoleController.delete);

// Permissions
router.post(
  '/:id/permissions',
  requirePermission('roles.manage.update'),
  RoleController.assignPermission,
);
router.delete(
  '/:id/permissions/:permissionId',
  requirePermission('roles.manage.update'),
  RoleController.revokePermission,
);

export { router as roleRouter };
