import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointmentService,
  getAppointmentService,
  getAppointmentServiceById,
} from '../controllers/appointmentService';

const router = Router();

router.post('/', [validateJWT, validateFields], createAppointmentService);
router.get('/', [validateJWT, validateFields], getAppointmentService);
router.get('/:id', [validateJWT, validateFields], getAppointmentServiceById);

export default router;
