import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { requireAuth } from '@repo/auth';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Only authenticated endpoints
router.use(requireAuth);

router.get(
  '/journal-entries',
  requirePermission('ledger.manage.read'),
  LedgerController.getJournalEntries,
);
router.get(
  '/accounts',
  requirePermission('ledger.manage.read'),
  LedgerController.getLedgerAccounts,
);

export { router as ledgerRouter };
