import { Request, Response } from 'express';
import { PurchaseOrderService } from './purchase-order.service';

export class PurchaseOrderController {
  static async createPurchaseOrder(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { items, ...data } = req.body;
      const po = await PurchaseOrderService.createPurchaseOrder(tenantId, data, items || []);
      res.status(201).json(po);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPurchaseOrders(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { branchId } = req.query;
      const pos = await PurchaseOrderService.getPurchaseOrders(
        tenantId,
        branchId as string | undefined,
      );
      res.json(pos);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPurchaseOrderById(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;
      const po = await PurchaseOrderService.getPurchaseOrderById(tenantId, id);
      if (!po) {
        return res.status(404).json({ error: 'Purchase Order not found' });
      }
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updatePurchaseOrderStatus(req: Request, res: Response) {
    try {
      const { tenantId } = req.user!;
      const { id } = req.params;
      const { status } = req.body;
      const po = await PurchaseOrderService.updatePurchaseOrderStatus(tenantId, id, status);
      res.json(po);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
