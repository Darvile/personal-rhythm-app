import { Router } from 'express';
import componentRoutes from './component.routes';
import recordRoutes from './record.routes';

const router = Router();

router.use('/components', componentRoutes);
router.use('/records', recordRoutes);

export default router;
