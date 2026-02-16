import { Router } from 'express';
import {
  getStagesByComponent,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from '../controllers/stage.controller';
import { validate } from '../middleware/validate';
import {
  createStageSchema,
  updateStageSchema,
  stageIdSchema,
  getStagesByComponentSchema,
  reorderStagesSchema,
} from '../schemas/stage.schema';

const router = Router();

router.get('/', validate(getStagesByComponentSchema), getStagesByComponent);
router.post('/', validate(createStageSchema), createStage);
router.patch('/:id', validate(updateStageSchema), updateStage);
router.delete('/:id', validate(stageIdSchema), deleteStage);
router.put('/reorder/:componentId', validate(reorderStagesSchema), reorderStages);

export default router;
