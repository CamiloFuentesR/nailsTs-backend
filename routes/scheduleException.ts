import { Router } from 'express';
import { isAdminRole, validateJWT } from '../middleware';
import {
  createScheduleException,
  deleteScheduleException,
  getScheduleExceptions,
} from '../controllers/scheduleException';

const router = Router();

router.get('/', getScheduleExceptions);
router.post('/', validateJWT, isAdminRole, createScheduleException);
router.delete('/:id', validateJWT, isAdminRole, deleteScheduleException);

export default router;
