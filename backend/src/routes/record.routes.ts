import { Router } from 'express';
import {
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord,
} from '../controllers/record.controller';
import { validate } from '../middleware/validate';
import { createRecordSchema, updateRecordSchema, recordIdSchema } from '../schemas/record.schema';

const router = Router();

router.get('/', getRecords);
router.post('/', validate(createRecordSchema), createRecord);
router.patch('/:id', validate(updateRecordSchema), updateRecord);
router.delete('/:id', validate(recordIdSchema), deleteRecord);

export default router;
