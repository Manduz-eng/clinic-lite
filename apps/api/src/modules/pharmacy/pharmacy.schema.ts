import { z } from 'zod';

export const createDrugSchema = z.object({
  name: z.string().min(1),
  brandName: z.string().optional(),
  code: z.string().min(1),
  category: z.string().optional(),
  form: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().min(0),
  reorderLevel: z.number().int().min(0).default(10),
});

export const updateDrugSchema = createDrugSchema.partial();

export const addStockSchema = z.object({
  drugId: z.string().uuid(),
  batchNumber: z.string().min(1),
  quantity: z.number().int().min(1),
  costPrice: z.number().min(0),
  expiryDate: z.string(),
  receivedDate: z.string().optional(),
});

export const dispenseSchema = z.object({
  prescriptionId: z.string().uuid(),
  visitId: z.string().uuid(),
  items: z.array(z.object({
    prescriptionItemId: z.string().uuid(),
    drugStockId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
  notes: z.string().optional(),
});
