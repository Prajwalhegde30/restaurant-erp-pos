import { Response, NextFunction } from 'express';
import { InventoryItemService } from './inventory-item.service';
import { AuthRequest } from '@repo/auth';
import { InventoryItemSchema } from '@repo/types';

const CreateInventoryItemDto = InventoryItemSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  isDeleted: true,
  deletedAt: true,
  version: true,
});

const UpdateInventoryItemDto = CreateInventoryItemDto.partial();

export class InventoryItemController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateInventoryItemDto.parse(req.body);
      const inventoryItem = await InventoryItemService.createInventoryItem(tenantId, data);

      res.status(201).json(inventoryItem);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const branchId = req.query.branchId as string | undefined;

      const inventoryItems = await InventoryItemService.getInventoryItems(tenantId, branchId);

      res.status(200).json({
        data: inventoryItems,
        has_more: false,
        next_cursor: null,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const inventoryItem = await InventoryItemService.getInventoryItemById(
        tenantId,
        req.params.id,
      );

      if (!inventoryItem) {
        return res.status(404).json({ error: { message: 'Inventory Item not found' } });
      }

      res.status(200).json(inventoryItem);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateInventoryItemDto.parse(req.body);
      await InventoryItemService.updateInventoryItem(tenantId, req.params.id, data);

      const inventoryItem = await InventoryItemService.getInventoryItemById(
        tenantId,
        req.params.id,
      );
      res.status(200).json(inventoryItem);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await InventoryItemService.deleteInventoryItem(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
