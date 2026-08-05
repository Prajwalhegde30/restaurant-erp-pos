import { Request, Response } from 'express';
import { PaymentService } from './payment.service';
import { CreatePaymentSchema } from './payment.schema';

export class PaymentController {
  static async processPayment(req: Request, res: Response) {
    try {
      const data = CreatePaymentSchema.parse(req.body);
      const tenantId = req.tenantId as string;
      const idempotencyKey = req.idempotencyKey as string;
      const userId = req.user?.id;

      const result = await PaymentService.processPayment(tenantId, idempotencyKey, data, userId);

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      if (error instanceof Error) {
        if ('code' in error && error.code === 'P2002') {
          // Prisma Unique Constraint (Idempotency Key Conflict)
          return res.status(409).json({ success: false, error: 'IDEMPOTENCY_KEY_CONFLICT' });
        }
        if (error.message === 'ORDER_NOT_FOUND') {
          return res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND' });
        }
        if (
          ['INVALID_ORDER_STATE', 'INVOICE_ALREADY_PAID', 'CONCURRENCY_CONFLICT'].includes(
            error.message,
          )
        ) {
          return res.status(409).json({ success: false, error: error.message });
        }
        return res
          .status(400)
          .json({ success: false, error: error.message || 'Payment processing failed' });
      }
      return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}
