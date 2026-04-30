import { z } from 'zod';

export const stkPushSchema = z.object({
  invoiceId: z.string().uuid(),
  phoneNumber: z.string().min(10).max(15),
  amount: z.number().min(1),
});
