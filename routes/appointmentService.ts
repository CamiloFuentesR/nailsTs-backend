import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointmentService,
  getAppointmentService,
  getAppointmentServiceByAppointment,
  getAppointmentServiceByClient,
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
router.get(
  '/:id',
  [validateJWT, validateFields],
  getAppointmentServiceByAppointment,
);
router.get(
  '/byClient/:id',
  [validateJWT, validateFields],
  getAppointmentServiceByClient,
);

export default router;
