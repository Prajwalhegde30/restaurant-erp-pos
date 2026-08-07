import { Response, NextFunction } from 'express';
import { CustomerService } from './customer.service';
import { AuthRequest } from '@repo/auth';
import { CustomerSchema } from '@repo/types';

const CreateCustomerDto = CustomerSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  status: true,
});

const UpdateCustomerDto = CreateCustomerDto.partial();

export class CustomerController {
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.user?.id;
      if (!tenantId || !userId) throw new Error('Tenant or User context missing');

      const data = CreateCustomerDto.parse(req.body);
      const customer = await CustomerService.createCustomer(tenantId, userId, data);

      res.status(201).json(customer);
    } catch (err) {
      next(err);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const cursor = req.query.cursor as string | undefined;

      const result = await CustomerService.getCustomers(tenantId, limit, cursor);

      res.status(200).json({
        data: result.data,
        has_more: result.hasMore,
        next_cursor: result.nextCursor,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const customer = await CustomerService.getCustomerById(tenantId, req.params.id);

      if (!customer) {
        return res.status(404).json({ error: { message: 'Customer not found' } });
      }

      res.status(200).json(customer);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.user?.id;
      if (!tenantId || !userId) throw new Error('Tenant or User context missing');

      const data = UpdateCustomerDto.parse(req.body);
      await CustomerService.updateCustomer(tenantId, req.params.id, userId, data);

      const customer = await CustomerService.getCustomerById(tenantId, req.params.id);
      res.status(200).json(customer);
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.user?.id;
      if (!tenantId || !userId) throw new Error('Tenant or User context missing');

      await CustomerService.deleteCustomer(tenantId, req.params.id, userId);

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  static async accruePoints(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const userId = req.user?.id;
      if (!tenantId || !userId) throw new Error('Tenant or User context missing');

      const { orderId } = req.body;
      if (!orderId) throw new Error('orderId is required');

      const { LoyaltyService } = await import('./loyalty.service');
      const result = await LoyaltyService.accruePointsForOrder(tenantId, orderId, userId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getLoyaltyBalance(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      if (!tenantId) throw new Error('Tenant context missing');

      const { LoyaltyService } = await import('./loyalty.service');
      const balance = await LoyaltyService.getCustomerBalance(tenantId, req.params.id);

      res.status(200).json({ balance });
    } catch (err) {
      next(err);
    }
  }

  static async applyCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const customerId = req.params.id; // Optional context, but provided in route
      if (!tenantId) throw new Error('Tenant context missing');

      const { code, orderId } = req.body;
      if (!code || !orderId) throw new Error('code and orderId are required');

      const { CouponService } = await import('./coupon.service');
      const result = await CouponService.applyCoupon(tenantId, code, orderId, customerId);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async redeemGiftCard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId;
      const customerId = req.params.id; // Optional customer validation
      if (!tenantId) throw new Error('Tenant context missing');

      const { code, orderId, amount } = req.body;
      if (!code || !orderId || amount === undefined)
        throw new Error('code, orderId, and amount are required');

      const { GiftCardService } = await import('./gift-card.service');
      const result = await GiftCardService.redeemGiftCard(
        tenantId,
        code,
        orderId,
        Number(amount),
        customerId,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
