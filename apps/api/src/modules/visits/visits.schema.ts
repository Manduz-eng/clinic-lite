import { z } from 'zod';

export const createVisitSchema = z.object({
  patientId: z.string().uuid(),
  visitType: z.enum(['new_visit', 'follow_up', 'emergency']).default('new_visit'),
  priority: z.enum(['normal', 'urgent', 'emergency']).default('normal'),
  chiefComplaint: z.string().optional(),
  assignedDoctorId: z.string().uuid().optional(),
});

export const updateVisitStatusSchema = z.object({
  status: z.enum([
    'queued', 'in_triage', 'in_nursing', 'with_doctor',
    'in_lab', 'at_pharmacy', 'billing', 'completed', 'cancelled',
  ]),
});
