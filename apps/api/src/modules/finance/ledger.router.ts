import { Router } from 'express';
import { LedgerController } from './ledger.controller';
import { requireAuth } from '@repo/auth';

const router = Router();

// Only authenticated endpoints
router.use(requireAuth);

router.get('/journal-entries', LedgerController.getJournalEntries);
router.get('/accounts', LedgerController.getLedgerAccounts);

export { router as ledgerRouter };
