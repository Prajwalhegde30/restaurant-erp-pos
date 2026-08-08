import { AuthRequest } from '@repo/auth';
import { Response } from 'express';
import { InvoiceService } from './invoice.service';

export class InvoiceController {
  static async getInvoices(req: AuthRequest, res: Response) {
    try {
      const tenantId = req.tenantId as string;
      const branchId = req.query.branchId as string as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const cursor = req.query.cursor as string | undefined;

      const result = await InvoiceService.listInvoices(tenantId, { branchId, limit, cursor });

      return res.status(200).json({
        data: result.data,
        has_more: result.hasMore,
        next_cursor: result.nextCursor,
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }

  static async getInvoiceById(req: AuthRequest, res: Response) {
    try {
      const tenantId = req.tenantId as string;
      const id = req.params.id;

      const invoice = await InvoiceService.getInvoice(tenantId, id);
      if (!invoice) {
        return res.status(404).json({ success: false, error: 'INVOICE_NOT_FOUND' });
      }

      return res.status(200).json(invoice);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ success: false, error: error.message });
      }
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
