"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentById = exports.updateAppointmentState = exports.deleteAppointment = exports.updateAppointment = exports.getAppointmentByMonth = exports.getAcceptedAppointment = exports.getAllAppointmentByDate = exports.getAllAppointment = exports.createAppointment = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const haySolape_1 = require("../helpers/haySolape");
/**
 * ¿El error viene de la restricción de solape de la base?
 *
 * Es la última línea de defensa: la restricción citas_sin_solape saltó porque
 * el horario se tomó entre la consulta de solape y el INSERT. Por la API no
 * debería pasar nunca, porque el lock consultivo serializa las escrituras; el
 * caso real es una escritura por fuera, o un endpoint futuro que no tome el
 * lock. Sin esto responde 500 con el texto crudo de Postgres, que además filtra
 * el nombre interno de la restricción al cliente.
 */
const esSolapeDeLaBase = (error) => error instanceof sequelize_1.ExclusionConstraintError &&
    error.constraint === 'citas_sin_solape';
/** Mismo texto que el 409 del chequeo previo: el frontend no distingue. */
const MSG_HORARIO_TOMADO = 'Ese horario ya fue tomado. Elige otro, por favor.';
/**
 * Cuántas veces se hizo un servicio dentro de la cita.
 *
 * Solo pasa de 1 en los servicios marcados como `por_unidad`, como el parche de
 * polygel, que se cobra por uña: tres parches son una fila con cantidad 3 y no
 * tres filas.
 *
 * Cae en 1 cuando el campo no viene, que es el caso de todo lo que ya está
 * guardado y de cualquier cliente que todavía no lo mande. Lo que llegue mal ya
 * lo rechazó con 400 el validador de la ruta, antes de abrir la transacción y de
 * tomar el lock de agenda; esto es la red de abajo para que un valor raro nunca
 * se convierta en una fila que no cobra nada, y por eso no vuelve a devolver
 * error acá.
 */
const normalizarCantidad = (valor) => {
    if (typeof valor !== 'number' && typeof valor !== 'string')
        return 1;
    const numero = Number(valor);
    if (!Number.isInteger(numero) || numero < 1)
        return 1;
    return numero;
};
// export const createAppointment: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { id, service_id, category_id, ...appointmentData } = req.body;
//   console.log(req.body);
//   try {
//     const ap = await Appointment.findByPk(id);
//     if (ap) {
//       return res.status(500).json({
//         ok: false,
//         msg: 'Error al crear la cita, datos duplicados',
//       });
//     }
//     const appointment = await Appointment.create({
//       id,
//       service_id,
//       category_id,
//       ...appointmentData,
//     });
//     return res.status(201).json({
//       ok: true,
//       msg: 'Cita creada con éxito',
//       appointment,
//     });
//   } catch (error: any) {
//     console.log(error.message);
//     res.status(500).json({
//       ok: false,
//       msg: 'Error al crear la cita',
//       details: error.message,
//     });
//   }
// };
const createAppointment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { servicesData, appointmentData } = req.body;
    console.log('Creating appointment with data:');
    console.log(req.body);
    // console.log(servicesData);
    // console.log(appointmentData);
    // Inicia una transacción
    const transaction = yield conection_1.default.transaction();
    try {
        const ap = yield appointment_1.default.findByPk(appointmentData.id, { transaction });
        if (ap) {
            yield transaction.rollback();
            return res.status(500).json({
                ok: false,
                msg: 'Error al crear la cita, datos duplicados',
            });
        }
        const inicio = new Date(appointmentData.start);
        const fin = new Date(appointmentData.end);
        if (!(0, haySolape_1.rangoValido)(inicio, fin)) {
            yield transaction.rollback();
            return res.status(400).json({
                ok: false,
                msg: 'El horario de la cita no es válido',
            });
        }
        // Serializa las escrituras de agenda y acota la espera por locks. El porqué
        // de cada parte está en tomarLockAgenda.
        yield (0, haySolape_1.tomarLockAgenda)(transaction);
        const solapada = yield (0, haySolape_1.buscarCitaSolapada)({ inicio, fin, transaction });
        if (solapada) {
            yield transaction.rollback();
            return res.status(409).json({
                ok: false,
                msg: MSG_HORARIO_TOMADO,
            });
        }
        const appointment = yield appointment_1.default.create({
            id: appointmentData.id,
            client_id: appointmentData.client_id,
            start: appointmentData.start,
            end: appointmentData.end,
            title: appointmentData.title,
            backgroundColor: appointmentData.backgroundColor,
            discount: appointmentData.discount,
            state: appointmentData.state,
            price: appointmentData.price,
            className: appointmentData.className,
            img: appointmentData.img,
        }, { transaction });
        // Prepara los datos de servicios relacionados con la cita
        const appointmentServices = servicesData.map((service) => ({
            appointment_id: appointment.id,
            service_id: service.service_id,
            state: service.state,
            appointment_service_price: service.price,
            cantidad: normalizarCantidad(service.cantidad),
        }));
        // Guarda los servicios relacionados
        yield models_1.AppointmentService.bulkCreate(appointmentServices, { transaction });
        // Confirma la transacción
        yield transaction.commit();
        return res.status(201).json({
            ok: true,
            msg: 'Cita creada con éxito',
            appointment,
        });
    }
    catch (error) {
        // Reversión de la transacción en caso de error
        yield transaction.rollback();
        if (esSolapeDeLaBase(error)) {
            return res.status(409).json({
                ok: false,
                msg: MSG_HORARIO_TOMADO,
            });
        }
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la cita',
            details: error.message,
        });
    }
});
exports.createAppointment = createAppointment;
const getAllAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointment = yield appointment_1.default.findAll({
            where: {
                state: {
                    [sequelize_1.Op.notIn]: [-1, 4],
                },
            },
        });
        if (appointment) {
            res.status(200).json({
                ok: true,
                msg: 'Se obtuvieron las citas con éxito',
                appointment,
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar datos',
            details: error.message,
        });
    }
});
exports.getAllAppointment = getAllAppointment;
const getAllAppointmentByDate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { start, end } = req.query;
        if (!start || !end) {
            return res.status(400).json({
                ok: false,
                msg: 'Los parámetros "start" y "end" son requeridos',
            });
        }
        const startDate = new Date(start);
        const endDate = new Date(end);
        const appointment = yield appointment_1.default.findAll({
            // where: {
            //   start: {
            //     [Op.between]: [startDate, endDate],
            //   },
            // },
            where: {
                start: { [sequelize_1.Op.gte]: new Date(start) },
                state: {
                    [sequelize_1.Op.notIn]: [-1, 4],
                },
            },
        });
        if (appointment) {
            res.status(200).json({
                ok: true,
                msg: 'Se obtuvieron las citas con éxito',
                appointment,
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar datos',
            details: error.message,
        });
    }
});
exports.getAllAppointmentByDate = getAllAppointmentByDate;
const getAcceptedAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const [totalAppointments, approvedAppointments, notApprovedAppointments] = yield Promise.all([
            appointment_1.default.count({
                where: {
                    start: {
                        [sequelize_1.Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
                    },
                    state: {
                        [sequelize_1.Op.notIn]: [-1, 4], // Filtra los estados que no son -1 ni 4
                    },
                },
            }),
            appointment_1.default.count({
                where: {
                    start: {
                        [sequelize_1.Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
                    },
                    // state: 2,
                    state: [2, 3],
                },
            }),
            appointment_1.default.count({
                where: {
                    start: {
                        [sequelize_1.Op.gte]: currentDate, // Filtra las citas a partir de la fecha actual
                    },
                    state: 1, // Filtra las citas no aprobadas
                },
            }),
        ]);
        res.status(200).json({
            ok: true,
            msg: 'Se obtuvieron las citas con éxito',
            totalAppointments,
            approvedAppointments,
            notApprovedAppointments,
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar datos',
            details: error.message,
        });
    }
});
exports.getAcceptedAppointment = getAcceptedAppointment;
const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
];
const getAppointmentByMonth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Realiza la consulta para contar citas por mes
        const citasPorMes = yield appointment_1.default.findAll({
            attributes: [
                [(0, sequelize_1.fn)('DATE_TRUNC', 'month', (0, sequelize_1.col)('start')), 'mes'], // Agrupa por mes usando la columna 'start'
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'totalCitas'], // Cuenta el número de citas
            ],
            where: {
                // state: {
                //   [Op.notIn]: [-1, 4],
                // },
                state: 3,
            },
            group: ['mes'], // Agrupa por mes
            order: [['mes', 'ASC']], // Ordena por mes en orden ascendente
        });
        // Mapear los resultados para incluir los nombres de meses en español
        const resultados = citasPorMes.map((registro) => {
            const mesIndex = new Date(registro.get('mes')).getMonth(); // Obtener el índice del mes
            return {
                month: monthNames[mesIndex], // Obtener el nombre del mes en español
                totalAppointment: Number(registro.get('totalCitas')),
            };
        });
        if (resultados.length > 0) {
            res.status(200).json({
                ok: true,
                msg: 'Se obtuvieron las citas por mes con éxito',
                appointmentByMonth: resultados,
            });
        }
        else {
            res.status(204).json({
                ok: false,
                msg: 'No se encontraron citas',
            });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar los datos',
            details: error.message,
        });
    }
});
exports.getAppointmentByMonth = getAppointmentByMonth;
// export const updateAppointment: RequestHandler = async (
//   req: Request,
//   res: Response,
// ) => {
//   const { id } = req.params;
//   const { body } = req;
//   try {
//     const [updatedRowsCount, updatedClients] = await Appointment.update(body, {
//       where: { id },
//       returning: true,
//     });
//     if (
//       updatedRowsCount === 0 ||
//       !updatedClients ||
//       updatedClients.length === 0
//     ) {
//       return res.status(404).json({
//         ok: false,
//         msg: 'Cita no encontrada o no actualizada',
//       });
//     }
//     return res.status(200).json({
//       ok: true,
//       msg: 'Cita actualizada con éxito',
//       appointment: updatedClients[0],
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       ok: false,
//       msg: 'Error interno del servidor al actualizar la cita',
//       error: error.message,
//     });
//   }
// };
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentData, servicesData } = req.body;
    // Inicia una transacción
    const transaction = yield conection_1.default.transaction();
    try {
        // Con { transaction } se reutiliza la conexión que ya tomó la transacción.
        // Sin eso pide una segunda al pool teniendo una ocupada, y con el pool por
        // defecto en 5 unas pocas peticiones simultáneas se bloquean entre sí.
        const appointment = yield appointment_1.default.findOne({
            where: { id: appointmentData.id },
            transaction,
        });
        if (!appointment) {
            yield transaction.rollback();
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada',
            });
        }
        const inicio = new Date(appointmentData.start);
        const fin = new Date(appointmentData.end);
        if (!(0, haySolape_1.rangoValido)(inicio, fin)) {
            yield transaction.rollback();
            return res.status(400).json({
                ok: false,
                msg: 'El horario de la cita no es válido',
            });
        }
        // Reprogramar tiene que tomar el mismo lock que crear: si no lo hiciera,
        // una creación y una reprogramación simultáneas podrían dejar dos citas en
        // el mismo horario.
        yield (0, haySolape_1.tomarLockAgenda)(transaction);
        // Cancelar libera el horario, no lo toma: una cancelación nunca debería
        // poder ser rechazada por "ese horario ya está tomado". Hoy no la rechaza,
        // pero solo porque ignorarId excluye la propia cita; eso es una coincidencia
        // afortunada y no una garantía, y con datos sucios la administradora se
        // quedaría sin la salida de emergencia. Los estados salen de haySolape para
        // no mantener una segunda lista literal de lo mismo.
        const liberaAgenda = haySolape_1.ESTADOS_QUE_NO_OCUPAN.includes(Number(appointmentData.state));
        // Se ignora la propia cita: al moverla dentro de su mismo horario se
        // chocaría consigo misma y quedaría imposible de guardar.
        const solapada = liberaAgenda
            ? null
            : yield (0, haySolape_1.buscarCitaSolapada)({
                inicio,
                fin,
                ignorarId: appointmentData.id,
                transaction,
            });
        if (solapada) {
            yield transaction.rollback();
            return res.status(409).json({
                ok: false,
                msg: MSG_HORARIO_TOMADO,
            });
        }
        // Actualiza la cita
        yield appointment.update({
            client_id: appointmentData.client_id,
            start: appointmentData.start,
            end: appointmentData.end,
            title: appointmentData.title,
            backgroundColor: appointmentData.backgroundColor,
            state: appointmentData.state,
            discount: appointmentData.discount,
            price: appointmentData.price,
            className: appointmentData.className,
            img: appointmentData.img,
        }, { transaction });
        yield models_1.AppointmentService.destroy({
            where: { appointment_id: appointmentData.id },
            transaction,
        });
        // La cantidad se guarda también acá, y no solo al crear: reprogramar o
        // editar una cita borra sus filas y las vuelve a insertar, así que sin esto
        // los tres parches de una cita ya guardada volverían a ser uno la primera
        // vez que ella le mueve la hora, y en silencio.
        const appointmentServices = servicesData.map((service) => ({
            appointment_id: appointmentData.id,
            service_id: service.service_id,
            state: service.state,
            appointment_service_price: service.price,
            cantidad: normalizarCantidad(service.cantidad),
        }));
        yield models_1.AppointmentService.bulkCreate(appointmentServices, { transaction });
        // Confirma la transacción
        yield transaction.commit();
        return res.status(200).json({
            ok: true,
            msg: 'Cita actualizada con éxito',
            appointment,
            // updateService,
        });
        // Itera sobre los datos de servicios recibidos y actualiza o crea según sea necesario
    }
    catch (error) {
        // Reversión de la transacción en caso de error
        yield transaction.rollback();
        if (esSolapeDeLaBase(error)) {
            return res.status(409).json({
                ok: false,
                msg: MSG_HORARIO_TOMADO,
            });
        }
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la cita',
            details: error.message,
        });
    }
});
exports.updateAppointment = updateAppointment;
const deleteAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // Inicia una transacción
    const transaction = yield conection_1.default.transaction();
    try {
        // Con { transaction } se reutiliza la conexión que ya tomó la transacción.
        // Sin eso pide una segunda al pool teniendo una ocupada, y con el pool por
        // defecto en 5 unas pocas peticiones simultáneas se bloquean entre sí.
        //
        // No lleva lock ni validación de solape a propósito: cancelar libera un
        // bloque de agenda, no lo toma.
        const appointment = yield appointment_1.default.findOne({
            where: { id: id },
            transaction,
        });
        if (!appointment) {
            yield transaction.rollback();
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada',
            });
        }
        // Actualiza el estado de la cita a -1
        yield appointment.update({ state: -1 }, { transaction });
        // Actualiza el estado de los servicios de la cita a -1
        yield models_1.AppointmentService.update({ state: -1 }, {
            where: { appointment_id: id },
            transaction,
        });
        // Confirma la transacción
        yield transaction.commit();
        return res.status(200).json({
            ok: true,
            msg: 'Su cita ha sido cancelada con éxito.',
            appointment,
        });
    }
    catch (error) {
        // Reversión de la transacción en caso de error
        yield transaction.rollback();
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la cita y los servicios',
            details: error.message,
        });
    }
});
exports.deleteAppointment = deleteAppointment;
const updateAppointmentState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const [affectedRows, updatedAppointments] = yield appointment_1.default.update({ state: -1 }, {
            where: { id: id },
            returning: true, // Para obtener los registros actualizados en Postgres
        });
        if (affectedRows === 0) {
            return null; // No se encontró el registro con el ID dado
        }
        return updatedAppointments[0]; // Retorna el primer registro actualizado
    }
    catch (error) {
        console.error('Error updating appointment state:', error);
        throw error;
    }
});
exports.updateAppointmentState = updateAppointmentState;
const getAppointmentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appointment = yield appointment_1.default.findByPk(id, {
            include: [
                {
                    model: models_1.Service,
                    attributes: ['name'],
                },
                {
                    model: models_1.ServicesCategory,
                    attributes: ['name'],
                },
            ],
        });
        if (!appointment) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron citas',
            });
        }
        return res.status(200).json({
            ok: true,
            appointment,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getAppointmentById = getAppointmentById;
//# sourceMappingURL=appoinment.js.map