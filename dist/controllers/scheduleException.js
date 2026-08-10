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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScheduleException = exports.createScheduleException = exports.getScheduleExceptions = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const scheduleValidation_1 = require("../helpers/scheduleValidation");
const getScheduleExceptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to } = req.query;
        const where = {};
        if (from && to) {
            where.date = { [sequelize_1.Op.between]: [from, to] };
        }
        const scheduleExceptions = yield models_1.ScheduleException.findAll({
            where,
            order: [['date', 'ASC']],
        });
        return res.status(200).json({
            ok: true,
            msg: 'Se obtuvieron las excepciones con éxito',
            scheduleExceptions,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar las excepciones',
            details: error.message,
        });
    }
});
exports.getScheduleExceptions = getScheduleExceptions;
const createScheduleException = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const excepcion = req.body;
        const error = (0, scheduleValidation_1.validarExcepcion)(excepcion);
        if (error) {
            return res.status(400).json({ ok: false, msg: error });
        }
        const scheduleException = yield models_1.ScheduleException.create(excepcion);
        return res.status(201).json({
            ok: true,
            msg: 'Cierre registrado con éxito',
            scheduleException,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al registrar el cierre',
            details: error.message,
        });
    }
});
exports.createScheduleException = createScheduleException;
const deleteScheduleException = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const borradas = yield models_1.ScheduleException.destroy({ where: { id } });
        if (borradas === 0) {
            return res.status(404).json({ ok: false, msg: 'Cierre no encontrado' });
        }
        return res
            .status(200)
            .json({ ok: true, msg: 'Cierre eliminado con éxito', id });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el cierre',
            details: error.message,
        });
    }
});
exports.deleteScheduleException = deleteScheduleException;
//# sourceMappingURL=scheduleException.js.map