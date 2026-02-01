import { Router } from 'express';
import {
  getAllComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent,
} from '../controllers/component.controller';
import { validate } from '../middleware/validate';
import {
  createComponentSchema,
  updateComponentSchema,
  componentIdSchema,
} from '../schemas/component.schema';

const router = Router();

router.get('/', getAllComponents);
router.get('/:id', validate(componentIdSchema), getComponentById);
router.post('/', validate(createComponentSchema), createComponent);
router.patch('/:id', validate(updateComponentSchema), updateComponent);
router.delete('/:id', validate(componentIdSchema), deleteComponent);

export default router;
