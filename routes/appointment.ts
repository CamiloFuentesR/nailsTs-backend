import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointment,
  deleteAppointment,
  getAcceptedAppointment,
  getAllAppointment,
  getAllAppointmentByDate,
  getAppointmentById,
  getAppointmentByMonth,
  updateAppointment,
} from '../controllers/appoinment';
import { check } from 'express-validator';
import {
  categoryByIdExist,
  clientByIdExist,
  isValidRole,
  serviceByIdExist,
} from '../helpers/dbValidator';

const router = Router();

router.post(
  '/',
  [
    validateJWT,
    check('appointmentData.role').custom(isValidRole),
    check('servicesData.*.service_id').custom(serviceByIdExist),
    check('appointmentData.client_id').custom(clientByIdExist),
    // check('category_id').custom(categoryByIdExist),
    validateFields,
  ],
  createAppointment,
);

router.get('/', getAllAppointment);
router.get('/ByData', getAllAppointmentByDate);
router.get('/reportByMonth', validateJWT, getAppointmentByMonth);
router.get('/reportAccept', validateJWT, getAcceptedAppointment);
router.get('/:id', validateJWT, getAppointmentById);
router.put(
  '/:id',
  validateJWT,
  check('servicesData.*.service_id').custom(serviceByIdExist),
  check('appointmentData.client_id').custom(clientByIdExist),
  validateFields,
  updateAppointment,
);
router.delete('/:id', validateJWT, deleteAppointment);

export default router;
