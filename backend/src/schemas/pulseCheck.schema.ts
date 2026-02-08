import { z } from 'zod';

export const createPulseCheckSchema = z.object({
  body: z.object({
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    energyLevel: z.number().int().min(1).max(5),
    moodLevel: z.number().int().min(1).max(5),
    note: z.string().max(500).optional(),
  }),
});

export const updatePulseCheckSchema = z.object({
  body: z.object({
    energyLevel: z.number().int().min(1).max(5).optional(),
    moodLevel: z.number().int().min(1).max(5).optional(),
    note: z.string().max(500).optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const pulseCheckIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const pulseCheckQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export type CreatePulseCheckInput = z.infer<typeof createPulseCheckSchema>['body'];
export type UpdatePulseCheckInput = z.infer<typeof updatePulseCheckSchema>['body'];
