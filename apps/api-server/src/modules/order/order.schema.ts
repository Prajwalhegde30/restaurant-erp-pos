import { z } from 'zod';
import { OrderType, OrderStatus } from '@prisma/client';

export const CreateOrderSchema = z.object({
  branchId: z.string().uuid(),
  diningTableId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(), // to support POS payload
  customerId: z.string().uuid().optional(),
  orderType: z.nativeEnum(OrderType).optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().int().positive(),
        notes: z.string().optional(),
        modifierSelections: z
          .array(
            z.object({
              modifierOptionId: z.string().uuid(),
            }),
          )
          .optional()
          .default([]), // Optional for schema, but service expects array
      }),
    )
    .optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  version: z.number().int(),
});

export const AddOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  modifierSelections: z
    .array(
      z.object({
        modifierOptionId: z.string().uuid(),
      }),
    )
    .default([]),
});
