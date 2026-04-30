import { z } from 'zod';

export const createNursingNoteSchema = z.object({
  visitId: z.string().uuid(),
  noteType: z.enum(['assessment', 'treatment', 'observation', 'handover']),
  content: z.string().min(1),
  treatmentRoom: z.string().optional(),
});

export const updateNursingNoteSchema = createNursingNoteSchema.omit({ visitId: true }).partial();
