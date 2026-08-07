import { z } from 'zod';
import { PaymentMethodSchema } from '@repo/types';

export const CreatePaymentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: PaymentMethodSchema,
  referenceCode: z.string().optional(),
  currentVersion: z.number().int().nonnegative(),
});
