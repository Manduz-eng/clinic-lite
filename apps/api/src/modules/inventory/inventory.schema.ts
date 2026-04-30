import { z } from 'zod';

export const resolveAlertSchema = z.object({
  id: z.string().uuid(),
});
