import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointmentService,
  getAppointmentService,
  getAppointmentServiceById,
  getAppointmentServiceReportByGroup,
} from '../controllers/appointmentService';

const router = Router();

router.post('/', [validateJWT, validateFields], createAppointmentService);
router.get('/', [validateJWT, validateFields], getAppointmentService);
router.get(
  '/reportByGroup',
  [validateJWT, validateFields],
  getAppointmentServiceReportByGroup,
);
router.get('/:id', [validateJWT, validateFields], getAppointmentServiceById);

export default router;
