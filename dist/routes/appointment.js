"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const appoinment_1 = require("../controllers/appoinment");
const express_validator_1 = require("express-validator");
const dbValidator_1 = require("../helpers/dbValidator");
const router = (0, express_1.Router)();
router.post('/', [
    middleware_1.validateJWT,
    (0, middleware_1.haveRole)('ADMIN_ROLE', 'USER_ROLE'),
    (0, express_validator_1.check)('appointmentData.role').custom(dbValidator_1.isValidRole),
    (0, express_validator_1.check)('servicesData.*.service_id').custom(dbValidator_1.serviceByIdExist),
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
    (0, express_validator_1.check)('servicesData.*.cantidad')
        .optional({ values: 'null' })
        .isInt({ min: 1 })
        .withMessage('La cantidad de cada servicio debe ser un entero de 1 o más'),
    (0, express_validator_1.check)('appointmentData.client_id').custom(dbValidator_1.clientByIdExist),
    (0, express_validator_1.check)('appointmentData.start')
        .isISO8601()
        .withMessage('Fecha de inicio inválida'),
    (0, express_validator_1.check)('appointmentData.end')
        .isISO8601()
        .withMessage('Fecha de término inválida'),
    // check('category_id').custom(categoryByIdExist),
    middleware_1.validateFields,
], appoinment_1.createAppointment);
router.get('/', appoinment_1.getAllAppointment);
router.get('/ByData', appoinment_1.getAllAppointmentByDate);
router.get('/reportByMonth', middleware_1.validateJWT, appoinment_1.getAppointmentByMonth);
router.get('/reportAccept', middleware_1.validateJWT, appoinment_1.getAcceptedAppointment);
router.get('/:id', middleware_1.validateJWT, appoinment_1.getAppointmentById);
router.put('/:id', middleware_1.validateJWT, (0, middleware_1.haveRole)('ADMIN_ROLE', 'USER_ROLE'), (0, express_validator_1.check)('servicesData.*.service_id').custom(dbValidator_1.serviceByIdExist), 
// Mismo chequeo que al crear: editar una cita borra sus filas y las vuelve a
// insertar, así que la cantidad se manda otra vez y hay que validarla igual.
(0, express_validator_1.check)('servicesData.*.cantidad')
    .optional({ values: 'null' })
    .isInt({ min: 1 })
    .withMessage('La cantidad de cada servicio debe ser un entero de 1 o más'), (0, express_validator_1.check)('appointmentData.client_id').custom(dbValidator_1.clientByIdExist), (0, express_validator_1.check)('appointmentData.start')
    .isISO8601()
    .withMessage('Fecha de inicio inválida'), (0, express_validator_1.check)('appointmentData.end')
    .isISO8601()
    .withMessage('Fecha de término inválida'), middleware_1.validateFields, appoinment_1.updateAppointment);
router.delete('/:id', [middleware_1.validateJWT, (0, middleware_1.haveRole)('ADMIN_ROLE', 'USER_ROLE')], appoinment_1.deleteAppointment);
exports.default = router;
//# sourceMappingURL=appointment.js.map