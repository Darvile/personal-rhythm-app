import { Router } from 'express';
import componentRoutes from './component.routes';
import recordRoutes from './record.routes';
import pulseCheckRoutes from './pulseCheck.routes';
import stageRoutes from './stage.routes';

const router = Router();

router.use('/components', componentRoutes);
router.use('/records', recordRoutes);
router.use('/pulse-checks', pulseCheckRoutes);
router.use('/stages', stageRoutes);

export default router;
