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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppointmentServiceByClient = exports.getAppointmentServiceByAppointment = exports.getAppointmentServiceReportByGroup = exports.getAppointmentService = exports.createAppointmentService = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const createAppointmentService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { id } = _a, appointmentServiceData = __rest(_a, ["id"]);
        const apService = yield models_1.AppointmentService.findByPk(id);
        if (apService) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al crear la prestacion, datos duplicados',
            });
        }
        const appointmentService = yield models_1.AppointmentService.create(Object.assign({ id }, appointmentServiceData));
        return res.status(201).json({
            ok: true,
            msg: 'Cita creada con éxito',
            appointmentService,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la prestacion de servicios',
            details: error.message,
        });
    }
});
exports.createAppointmentService = createAppointmentService;
const getAppointmentService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointmentService = yield models_1.AppointmentService.findAll({
            include: [
                {
                    model: models_1.Service,
                    attributes: [
                        'id',
                        'name',
                        'services_category_id',
                        'price',
                        'duration',
                    ],
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                },
            ],
        });
        if (appointmentService.length > 0) {
            return res.status(200).json({ ok: true, appointmentService });
        }
        return res.status(400).json({
            ok: false,
            msg: 'No se encontraron datos',
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.getAppointmentService = getAppointmentService;
const getAppointmentServiceReportByGroup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtén todos los servicios de citas con las categorías y el estado de la cita
        const appointmentServices = yield models_1.AppointmentService.findAll({
            include: [
                {
                    model: models_1.Service,
                    attributes: [
                        'id',
                        'name',
                        'services_category_id',
                        'price',
                        'duration',
                    ],
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                },
                {
                    model: models_1.Appointment,
                    attributes: [],
                    where: {
                        state: 3, // Filtra solo las citas con estado 3
                    },
                },
            ],
        });
        // Agrupar por categoría y contar
        const groupedData = appointmentServices.reduce((acc, appointmentService) => {
            const categoryName = appointmentService.Service.category.name;
            if (!acc[categoryName]) {
                acc[categoryName] = { label: categoryName, value: 0 };
            }
            acc[categoryName].value += 1;
            return acc;
        }, {});
        // Convertir a array y ordenar por valor en orden descendente
        const sortedData = Object.values(groupedData).sort((a, b) => b.value - a.value);
        if (appointmentServices.length > 0) {
            return res.status(200).json({ ok: true, serviceAppointment: sortedData });
        }
        return res.status(400).json({
            ok: false,
            msg: 'No se encontraron datos',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al obtener los datos',
        });
    }
});
exports.getAppointmentServiceReportByGroup = getAppointmentServiceReportByGroup;
const getAppointmentServiceByAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appointment = yield models_1.AppointmentService.findAll({
            where: {
                appointment_id: id,
            },
            include: [
                {
                    model: models_1.Service,
                    attributes: [
                        'id',
                        'name',
                        'services_category_id',
                        'price',
                        'duration',
                    ],
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
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
exports.getAppointmentServiceByAppointment = getAppointmentServiceByAppointment;
const getAppointmentServiceByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appointmentServices = yield models_1.AppointmentService.findAll({
            include: [
                {
                    model: models_1.Service,
                    attributes: [
                        'id',
                        'name',
                        'services_category_id',
                        'price',
                        'duration',
                    ],
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                },
                {
                    model: models_1.Appointment,
                    attributes: ['id', 'start', 'end', 'title', 'client_id', 'state'],
                    where: {
                        client_id: id,
                        state: {
                            [sequelize_1.Op.notIn]: [-1], // Filtra los estados que no son -1 ni 4
                        },
                    },
                    order: [['start', 'DESC']], // Ordenar por fecha de inicio de manera descendente
                },
            ],
        });
        if (!appointmentServices || appointmentServices.length === 0) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron citas para el cliente especificado',
            });
        }
        // Agrupar por appointment_id
        const groupedAppointments = appointmentServices.reduce((acc, curr) => {
            const appointmentId = curr.appointment_id;
            if (!acc[appointmentId]) {
                acc[appointmentId] = Object.assign(Object.assign({}, curr.Appointment.dataValues), { services: [] });
            }
            acc[appointmentId].services.push(Object.assign(Object.assign({}, curr.Service.dataValues), { price: curr.price, state: curr.state }));
            return acc;
        }, {});
        // Convertir objeto agrupado en array y ordenar por fecha de inicio de manera descendente
        const result = Object.values(groupedAppointments).sort((a, b) => {
            return new Date(b.start).getTime() - new Date(a.start).getTime();
        });
        return res.status(200).json({
            ok: true,
            appointments: result,
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
exports.getAppointmentServiceByClient = getAppointmentServiceByClient;
//# sourceMappingURL=appointmentService.js.map