import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createComponentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100),
    weight: z.enum(['low', 'medium', 'high']).default('medium'),
    minWeeklyFreq: z.number().int().min(1, 'Minimum weekly frequency must be at least 1'),
    color: z.string().regex(hexColorRegex, 'Color must be a valid hex code (#RRGGBB)'),
  }),
});

export const updateComponentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    weight: z.enum(['low', 'medium', 'high']).optional(),
    minWeeklyFreq: z.number().int().min(1, 'Minimum weekly frequency must be at least 1').optional(),
    color: z.string().regex(hexColorRegex, 'Color must be a valid hex code (#RRGGBB)').optional(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const componentIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export type CreateComponentInput = z.infer<typeof createComponentSchema>['body'];
export type UpdateComponentInput = z.infer<typeof updateComponentSchema>['body'];
