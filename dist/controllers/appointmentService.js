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
exports.getEarningsByCategoryAndService = exports.getCurrentMonthEarningsByService = exports.getCurrentMonthEarningsByCategory = exports.getAppointmentServiceOneByClient = exports.getAppointmentServiceByClient = exports.getAppointmentServiceByAppointment = exports.getAppointmentServiceReportByGroup = exports.getAppointmentService = exports.createAppointmentService = void 0;
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
        // Calcular el inicio y fin del mes actual
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
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
                        start: {
                            [sequelize_1.Op.between]: [currentMonthStart, currentMonthEnd], // Filtra solo las citas dentro del mes actual
                        },
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
        // Convertir a array y ordenar por nombre de categoría en orden ascendente
        const sortedData = Object.values(groupedData).sort((a, b) => a.label.localeCompare(b.label));
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
                        // {
                        //   model: Appointment,
                        //   as: 'appointment',
                        //   attributes: ['img'],
                        // },
                    ],
                },
                {
                    model: models_1.Appointment,
                    // as: 'appointment',
                    attributes: ['img'],
                },
            ],
        });
        console.log(appointment);
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
                    attributes: [
                        'id',
                        'start',
                        'end',
                        'title',
                        'client_id',
                        'img',
                        'state',
                    ],
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
            return res.status(200).json({
                ok: true,
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
const getAppointmentServiceOneByClient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Busca todos los servicios de la cita utilizando el 'appointment_id'
        const appointmentServices = yield models_1.AppointmentService.findAll({
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
                {
                    model: models_1.Appointment,
                    attributes: [
                        'id',
                        'start',
                        'end',
                        'title',
                        'client_id',
                        'state',
                        'img',
                    ],
                    where: {
                        state: {
                            [sequelize_1.Op.notIn]: [-1],
                        },
                    },
                },
            ],
            order: [['Appointment', 'start', 'DESC']], // Ordenar por fecha de inicio de manera descendente
        });
        // Organiza los servicios agrupados por cita
        const appointments = appointmentServices.reduce((acc, appointmentService) => {
            const { Appointment: appointment, Service: service } = appointmentService;
            // Si la cita ya está en el acumulador, agrega el servicio a su array de servicios
            if (acc[appointment.id]) {
                acc[appointment.id].services.push(service);
            }
            else {
                // Si la cita no está en el acumulador, la agrega con sus servicios asociados
                acc[appointment.id] = Object.assign(Object.assign({}, appointment.get()), { services: [service] });
            }
            return acc;
        }, {});
        // Convierte el objeto de citas agrupadas en un array
        const result = Object.values(appointments);
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
exports.getAppointmentServiceOneByClient = getAppointmentServiceOneByClient;
const getCurrentMonthEarningsByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        const earnings = yield models_1.AppointmentService.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('Service.price')), 'totalEarnings'],
                [(0, sequelize_1.col)('Service.category.name'), 'label'],
                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('Service.id')), 'value'], // Contar el número de servicios por categoría
            ],
            include: [
                {
                    model: models_1.Service,
                    attributes: [], // No necesitamos atributos aquí
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: ['name'], // Asegúrate de que 'name' está aquí
                        },
                    ],
                },
                {
                    model: models_1.Appointment,
                    attributes: [],
                    where: {
                        start: {
                            [sequelize_1.Op.between]: [currentMonthStart, currentMonthEnd],
                        },
                        state: 3, // Filtra solo las citas con estado 3
                    },
                },
            ],
            group: ['Service.category.id', 'Service.category.name'], // Agrupar por ID y nombre de categoría
            order: [
                [(0, sequelize_1.col)('value'), 'DESC'], // Ordenar por el valor (cantidad) en orden descendente
                [(0, sequelize_1.col)('Service.category.name'), 'ASC'], // Luego ordenar por nombre de categoría en orden ascendente
            ],
        });
        const totalEarnings = earnings.reduce((sum, earning) => {
            var _a;
            const earningsValue = parseFloat(((_a = earning.getDataValue('totalEarnings')) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
            return sum + earningsValue;
        }, 0);
        return res.status(200).json({
            ok: true,
            earnings,
            totalEarnings,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getCurrentMonthEarningsByCategory = getCurrentMonthEarningsByCategory;
const getCurrentMonthEarningsByService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        const earningsByService = yield models_1.AppointmentService.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('Service.price')), 'totalEarnings'],
                [(0, sequelize_1.col)('Service.name'), 'serviceName'],
            ],
            include: [
                {
                    model: models_1.Service,
                    attributes: [],
                },
                {
                    model: models_1.Appointment,
                    attributes: [],
                    where: {
                        state: 3,
                        start: {
                            [sequelize_1.Op.between]: [currentMonthStart, currentMonthEnd],
                        },
                        // state: {
                        //   [Op.notIn]: [-1],
                        // },
                    },
                },
            ],
            where: {
                state: 3, // Filtrar por el estado 3 en AppointmentService
            },
            group: ['Service.id', 'Service.name'], // Agrupar por ID y nombre del servicio
            order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('Service.price')), 'DESC']], // Ordenar por el total de ganancias
        });
        const totalEarnings = earningsByService.reduce((sum, earning) => {
            var _a;
            const earningsValue = parseFloat(((_a = earning.getDataValue('totalEarnings')) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
            return sum + earningsValue;
        }, 0);
        return res.status(200).json({
            ok: true,
            earningsByService,
            totalEarnings,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getCurrentMonthEarningsByService = getCurrentMonthEarningsByService;
const getEarningsByCategoryAndService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        // Consulta para obtener los totales por categoría y por servicio
        const earnings = yield models_1.AppointmentService.findAll({
            attributes: [
                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('Service.price')), 'totalEarnings'],
                [(0, sequelize_1.col)('Service->category.name'), 'categoryName'],
                [(0, sequelize_1.col)('Service.name'), 'serviceName'], // Obtener el nombre del servicio
            ],
            include: [
                {
                    model: models_1.Service,
                    attributes: [],
                    include: [
                        {
                            model: models_1.ServicesCategory,
                            as: 'category',
                            attributes: [],
                        },
                    ],
                },
                {
                    model: models_1.Appointment,
                    attributes: [],
                    where: {
                        start: {
                            [sequelize_1.Op.between]: [currentMonthStart, currentMonthEnd],
                        },
                        state: {
                            [sequelize_1.Op.notIn]: [-1], // Filtra los estados que no son -1 (o cualquier otro estado que indique cancelación)
                        },
                    },
                },
            ],
            group: ['Service->category.id', 'Service.id'], // Agrupar por categoría y luego por servicio
            order: [[(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('Service.price')), 'DESC']], // Ordenar por las ganancias totales
        });
        let totalGlobalEarnings = 0;
        const earningsByCategory = earnings.reduce((result, earning) => {
            var _a;
            const categoryName = earning.getDataValue('categoryName');
            const serviceName = earning.getDataValue('serviceName');
            const totalEarnings = parseFloat(((_a = earning.getDataValue('totalEarnings')) === null || _a === void 0 ? void 0 : _a.toString()) || '0');
            // Sumar al total global
            totalGlobalEarnings += totalEarnings;
            // Buscar si la categoría ya existe en el resultado
            let category = result.find(cat => cat.categoryName === categoryName);
            // Si la categoría no existe, se crea y se agrega al array
            if (!category) {
                category = {
                    categoryName,
                    totalEarnings: 0,
                    services: [],
                };
                result.push(category);
            }
            // Agregar el total de la categoría
            category.totalEarnings += totalEarnings;
            // Agregar el servicio a la categoría
            category.services.push({
                serviceName,
                totalEarnings,
            });
            return result;
        }, []);
        // Ordenar las categorías por totalEarnings
        earningsByCategory.sort((a, b) => b.totalEarnings - a.totalEarnings);
        return res.status(200).json({
            ok: true,
            earningsByCategory,
            totalGlobalEarnings, // Incluye el total global
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: error.message,
        });
    }
});
exports.getEarningsByCategoryAndService = getEarningsByCategoryAndService;
//# sourceMappingURL=appointmentService.js.map