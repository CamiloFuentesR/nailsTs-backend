import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointmentService,
  getAppointmentService,
  getAppointmentServiceByAppointment,
  getAppointmentServiceByClient,
  getAppointmentServiceOneByClient,
  getAppointmentServiceReportByGroup,
  getCurrentMonthEarningsByCategory,
  getCurrentMonthEarningsByService,
  getEarningsByCategoryAndService,
} from '../controllers/appointmentService';

const router = Router();

router.post('/', [validateJWT, validateFields], createAppointmentService);
router.get('/', [validateJWT, validateFields], getAppointmentService);
router.get('/earningsByCategory', getCurrentMonthEarningsByCategory);
router.get('/earningsByServices', getCurrentMonthEarningsByService);
router.get(
  '/reportByGroup',
  [validateJWT, validateFields],
  getAppointmentServiceReportByGroup,
);
router.get(
  '/reportByCategoryAndService',
  [validateJWT, validateFields],
  getEarningsByCategoryAndService,
);
router.get(
  '/:id',
  // [validateJWT, validateFields],
  getAppointmentServiceByAppointment,
);
router.get(
  '/byClient/:id',
  [validateJWT, validateFields],
  getAppointmentServiceByClient,
);
router.get(
  '/onebyClient/:id',
  [validateJWT, validateFields],
  getAppointmentServiceOneByClient,
);

export default router;
