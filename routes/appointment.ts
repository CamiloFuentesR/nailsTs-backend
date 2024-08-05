import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointment,
  deleteAppointment,
  getAcceptedAppointment,
  getAllAppointment,
  getAppointmentById,
  getAppointmentByMonth,
  updateAppointment,
  updateAppointmentState,
} from '../controllers/appoinment';
import { check } from 'express-validator';
import {
  categoryByIdExist,
  clientByIdExist,
  serviceByIdExist,
} from '../helpers/dbValidator';

const router = Router();

router.post(
  '/',
  [
    validateJWT,
    // check('service_id').custom(serviceByIdExist),
    // check('category_id').custom(categoryByIdExist),
    // check('client_id').custom(clientByIdExist),
    validateFields,
  ],
  createAppointment,
);

router.get('/', validateJWT, getAllAppointment);
router.get('/reportByMonth', validateJWT, getAppointmentByMonth);
router.get('/reportAccept', validateJWT, getAcceptedAppointment);
router.get('/:id', validateJWT, getAppointmentById);
router.put('/:id', validateJWT, updateAppointment);
router.delete('/:id', validateJWT, deleteAppointment);

export default router;
