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
exports.getAppointmentById = exports.updateAppointmentState = exports.updateAppointment = exports.getAllAppointment = exports.createAppointment = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
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
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { servicesData, appointmentData } = req.body;
    // Inicia una transacción
    const transaction = yield conection_1.default.transaction();
    try {
        const ap = yield appointment_1.default.findByPk(appointmentData.id);
        if (ap) {
            yield transaction.rollback();
            return res.status(500).json({
                ok: false,
                msg: 'Error al crear la cita, datos duplicados',
            });
        }
        const appointment = yield appointment_1.default.create({
            id: appointmentData.id,
            client_id: appointmentData.client_id,
            start: appointmentData.start,
            end: appointmentData.end,
            title: appointmentData.title,
            backgroundColor: appointmentData.backgroundColor,
            state: appointmentData.state,
            price: appointmentData.price,
            className: appointmentData.className,
            // parafinoterapy: appointmentData.parafinoterapy,
            // retiro: appointmentData.retiro,
        }, { transaction });
        // Prepara los datos de servicios relacionados con la cita
        const appointmentServices = servicesData.map((service) => ({
            appointment_id: appointment.id,
            service_id: service.service_id,
            state: service.state,
            price: service.price,
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
                    [sequelize_1.Op.notIn]: [-1, 4], // Filtra los estados que no son -1 ni 4
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
        const appointment = yield appointment_1.default.findOne({
            where: { id: appointmentData.id },
        });
        if (!appointment) {
            yield transaction.rollback();
            return res.status(404).json({
                ok: false,
                msg: 'Cita no encontrada',
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
            price: appointmentData.price,
            className: appointmentData.className,
        }, { transaction });
        yield models_1.AppointmentService.destroy({
            where: { appointment_id: appointmentData.id },
            transaction,
        });
        const appointmentServices = servicesData.map((service) => ({
            appointment_id: appointmentData.id,
            service_id: service.service_id,
            state: service.state,
            price: service.price,
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
        console.log(error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la cita',
            details: error.message,
        });
    }
});
exports.updateAppointment = updateAppointment;
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