import { Router } from 'express';
import { validateFields, validateJWT } from '../middleware';
import {
  createAppointment,
  getAllAppointment,
  getAppointmentById,
  updateAppointment,
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
    check('service_id').custom(serviceByIdExist),
    check('category_id').custom(categoryByIdExist),
    check('client_id').custom(clientByIdExist),
    validateFields,
  ],
  createAppointment,
);

router.get('/', validateJWT, getAllAppointment);
router.get('/:id', validateJWT, getAppointmentById);
router.put('/:id', validateJWT, updateAppointment);

export default router;
