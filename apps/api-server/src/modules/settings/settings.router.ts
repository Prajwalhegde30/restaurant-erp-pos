import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

router.use(authMiddleware);

// Resolve Settings (Most specific to least specific context)
// This should technically be before /:id to avoid 'resolve' being treated as an id
router.get('/resolve', requirePermission('settings.manage.read'), SettingsController.resolve);

// Raw Settings CRUD
router.post('/', requirePermission('settings.manage.update'), SettingsController.upsert);
router.get('/', requirePermission('settings.manage.read'), SettingsController.getAll);
router.delete('/:id', requirePermission('settings.manage.delete'), SettingsController.delete);

export { router as settingsRouter };
