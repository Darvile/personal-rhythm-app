import { Router } from 'express';
import {
  getAllPulseChecks,
  getTodayPulseCheck,
  getPulseCheckById,
  createPulseCheck,
  updatePulseCheck,
  deletePulseCheck,
} from '../controllers/pulseCheck.controller';
import { getInsights } from '../controllers/insights.controller';
import { validate } from '../middleware/validate';
import {
  createPulseCheckSchema,
  updatePulseCheckSchema,
  pulseCheckIdSchema,
} from '../schemas/pulseCheck.schema';

const router = Router();

router.get('/', getAllPulseChecks);
router.get('/today', getTodayPulseCheck);
router.get('/insights', getInsights);
router.get('/:id', validate(pulseCheckIdSchema), getPulseCheckById);
router.post('/', validate(createPulseCheckSchema), createPulseCheck);
router.patch('/:id', validate(updatePulseCheckSchema), updatePulseCheck);
router.delete('/:id', validate(pulseCheckIdSchema), deletePulseCheck);

export default router;
