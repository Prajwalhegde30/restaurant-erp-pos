import { z } from 'zod';

export const OpenDaySchema = z.object({
  closingDate: z.string().datetime().optional(), // ISO string, defaults to today
});

export const CloseDaySchema = z.object({
  notes: z.string().optional(),
});
