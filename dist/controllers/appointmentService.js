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
exports.getAppointmentServiceById = exports.getAppointmentService = exports.createAppointmentService = void 0;
const models_1 = require("../models");
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
        const appointmentService = yield models_1.AppointmentService.findAll();
        if (appointmentService.length > 0) {
            return res.status(200).json({ ok: true, msg: appointmentService });
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
const getAppointmentServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const appointment = yield models_1.AppointmentService.findAll({
            attributes: ['appointment_id'],
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
exports.getAppointmentServiceById = getAppointmentServiceById;
//# sourceMappingURL=appointmentService.js.map