import { Router } from 'express';
import { BranchController } from './branch.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Protect all branch routes with authMiddleware
router.use(authMiddleware);

// Branch API routes
router.post('/', requirePermission('branches.manage.create'), BranchController.create);
router.get('/', requirePermission('branches.manage.read'), BranchController.getAll);
router.get('/:id', requirePermission('branches.manage.read'), BranchController.getById);
router.put('/:id', requirePermission('branches.manage.update'), BranchController.update);
router.delete('/:id', requirePermission('branches.manage.delete'), BranchController.delete);

export { router as branchRouter };
