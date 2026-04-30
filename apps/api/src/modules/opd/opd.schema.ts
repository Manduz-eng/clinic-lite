import { z } from 'zod';

export const createClinicalNoteSchema = z.object({
  visitId: z.string().uuid(),
  historyOfIllness: z.string().optional(),
  examinationFindings: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  followUpDate: z.string().optional(),
  diagnoses: z.array(z.object({
    icdCode: z.string().min(1),
    description: z.string().min(1),
    diagnosisType: z.enum(['primary', 'secondary', 'differential']),
  })).optional(),
});

export const createPrescriptionSchema = z.object({
  visitId: z.string().uuid(),
  notes: z.string().optional(),
  items: z.array(z.object({
    drugId: z.string().uuid(),
    dosage: z.string().min(1),
    frequency: z.string().min(1),
    duration: z.string().min(1),
    quantity: z.number().int().min(1),
    route: z.string().optional(),
    instructions: z.string().optional(),
  })).min(1),
});

export const updateClinicalNoteSchema = createClinicalNoteSchema.omit({ visitId: true }).partial();
