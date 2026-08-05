import { Request, Response } from 'express';
import { LedgerService } from './ledger.service';

export class LedgerController {
  static async getJournalEntries(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId as string;
      const { journalId, ledgerAccountId } = req.query;

      const entries = await LedgerService.getJournalEntries(tenantId, {
        journalId: journalId as string,
        ledgerAccountId: ledgerAccountId as string,
      });

      return res.status(200).json({ success: true, data: entries });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      });
    }
  }

  static async getLedgerAccounts(req: Request, res: Response) {
    try {
      const tenantId = req.tenantId as string;
      const accounts = await LedgerService.getLedgerAccounts(tenantId);
      return res.status(200).json({ success: true, data: accounts });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      });
    }
  }
}
