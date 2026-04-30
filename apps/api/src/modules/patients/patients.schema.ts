import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().transform((s) => new Date(s)),
  gender: z.enum(['male', 'female', 'other']),
  nationalId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNo: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
