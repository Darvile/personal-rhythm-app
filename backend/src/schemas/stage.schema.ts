import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createStageSchema = z.object({
  body: z.object({
    componentId: z.string().min(1, 'Component ID is required'),
    name: z.string().min(1, 'Name is required').max(200),
    description: z.string().max(1000).optional(),
    effortLevel: z.enum(['low', 'medium', 'high'], { required_error: 'Effort level is required' }),
    color: z.string().regex(hexColorRegex, 'Color must be a valid hex code (#RRGGBB)').optional(),
  }),
});

export const updateStageSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().nullable(),
    effortLevel: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
    color: z.string().regex(hexColorRegex).optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1),
  }),
});

export const stageIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const getStagesByComponentSchema = z.object({
  query: z.object({
    componentId: z.string().min(1, 'Component ID is required'),
  }),
});

export const reorderStagesSchema = z.object({
  body: z.object({
    stageIds: z.array(z.string().min(1)).min(1, 'At least one stage ID is required'),
  }),
  params: z.object({
    componentId: z.string().min(1),
  }),
});

export type CreateStageInput = z.infer<typeof createStageSchema>['body'];
export type UpdateStageInput = z.infer<typeof updateStageSchema>['body'];
export type ReorderStagesInput = z.infer<typeof reorderStagesSchema>['body'];
