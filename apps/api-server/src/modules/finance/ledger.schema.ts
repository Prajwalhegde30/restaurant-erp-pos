import { z } from 'zod';

export const CreateJournalSchema = z.object({
  body: z.object({
    description: z.string().min(1, 'Description is required').max(500),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
    entries: z
      .array(
        z.object({
          ledgerAccountId: z.string().uuid('Invalid Ledger Account ID'),
          entryType: z.enum(['DEBIT', 'CREDIT']),
          amount: z.number().positive('Amount must be positive'),
          description: z.string().max(255).optional(),
        }),
      )
      .min(2, 'A journal must have at least two entries')
      .refine(
        (entries) => {
          let debits = 0;
          let credits = 0;
          for (const entry of entries) {
            if (entry.entryType === 'DEBIT') debits += entry.amount;
            else if (entry.entryType === 'CREDIT') credits += entry.amount;
          }
          // Using a small epsilon to handle floating point precision issues
          return Math.abs(debits - credits) < 0.001;
        },
        {
          message: 'Total DEBIT amounts must equal total CREDIT amounts',
        },
      ),
  }),
});
