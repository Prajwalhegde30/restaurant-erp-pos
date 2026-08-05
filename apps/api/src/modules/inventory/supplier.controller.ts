import { Response, NextFunction } from 'express';
import { SupplierService } from './supplier.service';
import { AuthRequest } from '@repo/auth';
import { SupplierSchema } from '@repo/types';

const CreateSupplierDto = SupplierSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  isDeleted: true,
  deletedAt: true,
});

const UpdateSupplierDto = CreateSupplierDto.partial();

export class SupplierController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = CreateSupplierDto.parse(req.body);
      const supplier = await SupplierService.createSupplier(tenantId, data);

      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const branchId = req.query.branchId as string | undefined;

      const suppliers = await SupplierService.getSuppliers(tenantId, branchId);

      res.status(200).json({
        data: suppliers,
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

      const supplier = await SupplierService.getSupplierById(tenantId, req.params.id);

      if (!supplier) {
        return res.status(404).json({ error: { message: 'Supplier not found' } });
      }

      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const data = UpdateSupplierDto.parse(req.body);
      await SupplierService.updateSupplier(tenantId, req.params.id, data);

      const supplier = await SupplierService.getSupplierById(tenantId, req.params.id);
      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      await SupplierService.deleteSupplier(tenantId, req.params.id);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
