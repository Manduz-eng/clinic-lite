import { z } from 'zod';

export const createPatientSchema = z.object({
  firstName: z.string().min(1, "Other Names required").max(100),
  lastName: z.string().min(1, "Surname required").max(100),
  dateOfBirth: z.string().transform((s) => new Date(s)).refine((d) => !isNaN(d.getTime()), {
    message: "Invalid date format",
  }),
  gender: z.enum(['male', 'female', 'other']),
  idType: z.string().optional().nullable(),
  idNumber: z.string().optional().nullable(),
  phone: z.string().length(10, "Phone must be exactly 10 digits"),
  phone2: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  address: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  town: z.string().optional().nullable(),
  nationality: z.string().optional().nullable(),
  nextOfKin: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  nokPhone: z.string().optional().nullable(),
  postalAddress: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  insuranceProvider: z.string().optional().nullable(),
  insuranceNo: z.string().optional().nullable(),
});

export const updatePatientSchema = createPatientSchema.partial();
