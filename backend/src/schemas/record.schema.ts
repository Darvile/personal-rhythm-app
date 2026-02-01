import { z } from 'zod';

export const createRecordSchema = z.object({
  body: z.object({
    componentId: z.string().min(1, 'Component ID is required'),
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    effortLevel: z.enum(['low', 'medium', 'high']).default('medium'),
    note: z.string().max(500).optional(),
  }),
});

export const recordQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    componentId: z.string().optional(),
  }),
});

export const recordIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const updateRecordSchema = z.object({
  body: z.object({
    date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
    effortLevel: z.enum(['low', 'medium', 'high']).optional(),
    note: z.string().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>['body'];
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>['body'];
