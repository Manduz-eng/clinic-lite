import { z } from 'zod';

export const createSupplierSchema = z.object({
  name: z.string().min(1),
  contactPerson: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxPin: z.string().optional(),
  paymentTerms: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const createPurchaseOrderSchema = z.object({
  supplierId: z.string().uuid(),
  expectedDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    drugId: z.string().uuid(),
    quantity: z.number().int().min(1),
    unitCost: z.number().min(0),
  })).min(1),
});

export const createGrnSchema = z.object({
  purchaseOrderId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(z.object({
    poItemId: z.string().uuid(),
    drugId: z.string().uuid(),
    quantity: z.number().int().min(1),
    batchNumber: z.string().min(1),
    expiryDate: z.string(),
    costPrice: z.number().min(0),
  })).min(1),
});

export const approvePOSchema = z.object({
  status: z.enum(['approved', 'cancelled']),
});
