import { z } from 'zod';

export const OpenShiftSchema = z.object({
  openingFloat: z.number().min(0).default(0),
});

export const CloseShiftSchema = z.object({
  actualCash: z.number().min(0),
  closingFloat: z.number().min(0).default(0),
});
