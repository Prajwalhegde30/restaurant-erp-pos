import { Request, Response } from 'express';
import { GoodsReceiptService } from './goods-receipt.service';

export class GoodsReceiptController {
  static async createGoodsReceipt(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { items, ...data } = req.body;
      const grn = await GoodsReceiptService.createGoodsReceipt(tenantId, data, items || []);
      res.status(201).json(grn);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getGoodsReceipts(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { branchId } = req.query;
      const grns = await GoodsReceiptService.getGoodsReceipts(
        tenantId,
        branchId as string | undefined,
      );
      res.json(grns);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getGoodsReceiptById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;
      const grn = await GoodsReceiptService.getGoodsReceiptById(tenantId, id);
      if (!grn) {
        return res.status(404).json({ error: 'Goods Receipt not found' });
      }
      res.json(grn);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async completeGoodsReceipt(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;
      const result = await GoodsReceiptService.completeGoodsReceipt(tenantId, id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
