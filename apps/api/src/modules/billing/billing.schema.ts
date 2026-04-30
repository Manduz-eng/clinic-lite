import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  visitId: z.string().uuid(),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  dueDate: z.string().optional(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  paymentMethod: z.enum(['cash', 'mpesa', 'card', 'insurance', 'bank_transfer']),
  amount: z.number().min(0.01),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});
