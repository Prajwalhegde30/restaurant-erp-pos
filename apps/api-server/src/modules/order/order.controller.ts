import { Response, NextFunction } from 'express';
import { OrderService } from './order.service';
import { CreateOrderSchema, UpdateOrderStatusSchema, AddOrderItemSchema } from './order.schema';
import { AuthenticatedRequest } from '../../middleware/logger.middleware';

export class OrderController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const idempotencyKey = req.headers['idempotency-key'] as string;
      const userId = req.userId;

      if (!tenantId) throw new Error('Tenant context missing');
      if (!idempotencyKey) {
        return res.status(400).json({ error: { message: 'Idempotency-Key header is required' } });
      }

      const data = CreateOrderSchema.parse(req.body);
      const orderData = {
        ...data,
        diningTableId: data.diningTableId || data.tableId, // map tableId from POS
      };

      const order = await OrderService.createOrderWithItems(
        tenantId,
        idempotencyKey,
        orderData,
        userId,
      );

      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const branchId = req.query.branchId as string;
      if (!branchId) {
        return res.status(400).json({ error: { message: 'branchId query parameter is required' } });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const cursor = req.query.cursor as string | undefined;

      const result = await OrderService.getOrders(tenantId, branchId, limit, cursor);

      res.status(200).json({
        data: result.data,
        has_more: result.hasMore,
        next_cursor: result.nextCursor,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const order = await OrderService.getOrderById(tenantId, req.params.id);

      if (!order) {
        return res.status(404).json({ error: { message: 'Order not found' } });
      }

      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateOrderStatusSchema.parse(req.body);

      const order = await OrderService.updateOrderStatus(
        tenantId,
        req.params.id,
        data.status,
        data.version,
        userId,
      );

      res.status(200).json(order);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'CONCURRENCY_CONFLICT') {
          return res
            .status(409)
            .json({ error: { message: 'State has changed, please refresh (OCC)' } });
        }
        if (err.message === 'INVALID_STATE_TRANSITION') {
          return res.status(409).json({ error: { message: 'Invalid order state transition' } });
        }
      }
      next(err);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.userId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = AddOrderItemSchema.parse(req.body);

      const item = await OrderService.addItemToOrder(tenantId, req.params.id, data, userId);

      res.status(201).json(item);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.message === 'MENU_ITEM_NOT_FOUND') {
          return res.status(404).json({ error: { message: 'Menu item not found' } });
        }
        if (err.message === 'ORDER_NOT_FOUND') {
          return res.status(404).json({ error: { message: 'Order not found' } });
        }
      }
      next(err);
    }
  }
}
