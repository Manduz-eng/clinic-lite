import { z } from 'zod';

export const createLabTestSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.string().optional(),
  price: z.number().min(0),
  turnaroundTime: z.string().optional(),
});

export const createLabRequestSchema = z.object({
  visitId: z.string().uuid(),
  testId: z.string().uuid(),
  priority: z.enum(['normal', 'urgent', 'stat']).default('normal'),
  clinicalInfo: z.string().optional(),
});

export const createLabResultSchema = z.object({
  labRequestId: z.string().uuid(),
  resultValue: z.string().min(1),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  isAbnormal: z.boolean().default(false),
  notes: z.string().optional(),
});

export const updateLabRequestStatusSchema = z.object({
  status: z.enum(['requested', 'sample_collected', 'processing', 'completed', 'cancelled']),
});
