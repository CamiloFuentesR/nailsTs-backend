import { Router } from 'express';
import { haveRole, validateFields, validateJWT } from '../middleware';
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
    haveRole('ADMIN_ROLE', 'USER_ROLE'),
    check('appointmentData.role').custom(isValidRole),
    // Sin esto, un cuerpo sin servicesData revienta el .map del controlador y
    // sale como un 500 que parece una caída del servidor. Es una petición mal
    // formada y corresponde un 400: una cita sin servicios no es una cita.
    check('servicesData')
      .isArray({ min: 1 })
      .withMessage('La cita tiene que llevar al menos un servicio'),
    check('servicesData.*.service_id').custom(serviceByIdExist),
    // La cantidad va con los demás chequeos por fila y no en el controlador
    // porque acá se rechaza antes de abrir la transacción y de tomar el lock de
    // agenda, que serializa a todos los que están reservando. Un 400 desde
    // adentro haría esperar al resto para nada.
    //
    // optional({ values: 'null' }) y no el optional a secas: el campo ausente y
    // el campo en null son los dos "no me lo mandaron" y valen 1. Lo que NO se
    // deja pasar como ausente es el 0, que con 'falsy' se colaría y terminaría
    // guardado como 1 tapando el error; y un 0 o un negativo dejan una fila que
    // no cobra nada o que resta.
    check('servicesData.*.cantidad')
      .optional({ values: 'null' })
      .isInt({ min: 1 })
      .withMessage('La cantidad de cada servicio debe ser un entero de 1 o más'),
    check('appointmentData.client_id').custom(clientByIdExist),
    check('appointmentData.start')
      .isISO8601()
      .withMessage('Fecha de inicio inválida'),
    check('appointmentData.end')
      .isISO8601()
      .withMessage('Fecha de término inválida'),
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
  haveRole('ADMIN_ROLE', 'USER_ROLE'),
  // Mismo motivo que al crear: updateAppointment también recorre servicesData.
  check('servicesData')
    .isArray({ min: 1 })
    .withMessage('La cita tiene que llevar al menos un servicio'),
  check('servicesData.*.service_id').custom(serviceByIdExist),
  // Mismo chequeo que al crear: editar una cita borra sus filas y las vuelve a
  // insertar, así que la cantidad se manda otra vez y hay que validarla igual.
  check('servicesData.*.cantidad')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('La cantidad de cada servicio debe ser un entero de 1 o más'),
  check('appointmentData.client_id').custom(clientByIdExist),
  check('appointmentData.start')
    .isISO8601()
    .withMessage('Fecha de inicio inválida'),
  check('appointmentData.end')
    .isISO8601()
    .withMessage('Fecha de término inválida'),
  validateFields,
  updateAppointment,
);
router.delete(
  '/:id',
  [validateJWT, haveRole('ADMIN_ROLE', 'USER_ROLE')],
  deleteAppointment,
);

export default router;
