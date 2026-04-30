import { z } from 'zod';

export const createVitalsSchema = z.object({
  visitId: z.string().uuid(),
  systolicBp: z.number().int().min(50).max(300).optional(),
  diastolicBp: z.number().int().min(20).max(200).optional(),
  heartRate: z.number().int().min(20).max(250).optional(),
  temperature: z.number().min(30).max(45).optional(),
  weight: z.number().min(0.5).max(500).optional(),
  height: z.number().min(20).max(300).optional(),
  respiratoryRate: z.number().int().min(5).max(60).optional(),
  oxygenSaturation: z.number().min(50).max(100).optional(),
  notes: z.string().optional(),
});

export const updateVitalsSchema = createVitalsSchema.omit({ visitId: true }).partial();
