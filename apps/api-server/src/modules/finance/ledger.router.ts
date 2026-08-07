import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();

// Only authenticated endpoints

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

import { idempotencyMiddleware } from '../../middleware/idempotency.middleware';

router.post(
  '/journals',
  requirePermission('ledger.manage.create'),
  idempotencyMiddleware,
  LedgerController.postJournal,
);

export { router as ledgerRouter };
