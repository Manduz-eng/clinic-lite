import { z } from 'zod';

export const createExpenseCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createExpenseSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().min(0.01),
  description: z.string().min(1),
  referenceNo: z.string().optional(),
  expenseDate: z.string(),
  paymentMethod: z.enum(['cash', 'mpesa', 'bank_transfer', 'cheque']),
  receiptUrl: z.string().optional(),
});

export const approveExpenseSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const dateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
