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
exports.deleteScheduleRule = exports.updateScheduleRule = exports.replaceWeek = exports.createScheduleRule = exports.getScheduleRules = void 0;
const sequelize_1 = require("sequelize");
const conection_1 = __importDefault(require("../db/conection"));
const models_1 = require("../models");
const scheduleValidation_1 = require("../helpers/scheduleValidation");
/**
 * Resta un día a una fecha 'YYYY-MM-DD'. Aritmética de calendario pura, sin
 * zona horaria: la fecha ya viene resuelta desde el frontend, que es el único
 * lado del sistema que conoce la zona del negocio.
 */
const diaAnterior = (fecha) => {
    const [y, m, d] = fecha.split('-').map(Number);
    const anterior = new Date(Date.UTC(y, m - 1, d - 1));
    return anterior.toISOString().slice(0, 10);
};
const getScheduleRules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to } = req.query;
        const where = {};
        // Reglas que estuvieron vigentes en algún momento del rango pedido
        if (from && to) {
            where[sequelize_1.Op.and] = [
                { validFrom: { [sequelize_1.Op.lte]: to } },
                {
                    [sequelize_1.Op.or]: [
                        { validUntil: null },
                        { validUntil: { [sequelize_1.Op.gte]: from } },
                    ],
                },
            ];
        }
        const scheduleRules = yield models_1.ScheduleRule.findAll({
            where,
            order: [
                ['dayOfWeek', 'ASC'],
                ['startTime', 'ASC'],
            ],
        });
        return res.status(200).json({
            ok: true,
            msg: 'Se obtuvieron las reglas de horario con éxito',
            scheduleRules,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'No se pudieron cargar las reglas de horario',
            details: error.message,
        });
    }
});
exports.getScheduleRules = getScheduleRules;
const createScheduleRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const regla = req.body;
        const error = (0, scheduleValidation_1.validarRegla)(regla);
        if (error) {
            return res.status(400).json({ ok: false, msg: error });
        }
        // Se compara contra las que ya existen ese día
        const existentes = yield models_1.ScheduleRule.findAll({
            where: { dayOfWeek: regla.dayOfWeek },
        });
        if ((0, scheduleValidation_1.hayReglasSolapadas)([...existentes.map(r => r.toJSON()), regla])) {
            return res.status(409).json({
                ok: false,
                msg: 'Ya existe un horario que se superpone con este día',
            });
        }
        const scheduleRule = yield models_1.ScheduleRule.create(regla);
        return res.status(201).json({
            ok: true,
            msg: 'Horario recurrente creado con éxito',
            scheduleRule,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al crear el horario recurrente',
            details: error.message,
        });
    }
});
exports.createScheduleRule = createScheduleRule;
/**
 * Reemplaza la semana completa. No borra: cierra la vigencia de las reglas
 * anteriores y crea las nuevas, todo en una transacción. Así el historial
 * queda intacto (las semanas pasadas se siguen dibujando con el horario que
 * realmente rigió) y nunca hay un instante sin horario configurado.
 */
const replaceWeek = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { rules, validFrom } = req.body;
    if (!Array.isArray(rules)) {
        return res
            .status(400)
            .json({ ok: false, msg: 'Se espera un arreglo de reglas' });
    }
    if (!validFrom || !/^\d{4}-\d{2}-\d{2}$/.test(validFrom)) {
        return res.status(400).json({
            ok: false,
            msg: 'Se requiere validFrom con formato YYYY-MM-DD',
        });
    }
    const normalizadas = rules.map(r => (Object.assign(Object.assign({}, r), { validFrom, validUntil: null })));
    for (const regla of normalizadas) {
        const error = (0, scheduleValidation_1.validarRegla)(regla);
        if (error) {
            return res.status(400).json({ ok: false, msg: error });
        }
    }
    if ((0, scheduleValidation_1.hayReglasSolapadas)(normalizadas)) {
        return res.status(409).json({
            ok: false,
            msg: 'Hay bloques que se superponen dentro del mismo día',
        });
    }
    const transaction = yield conection_1.default.transaction();
    try {
        // 1. Cerrar la vigencia de todo lo que sigue vigente
        yield models_1.ScheduleRule.update({ validUntil: diaAnterior(validFrom) }, {
            where: {
                [sequelize_1.Op.or]: [
                    { validUntil: null },
                    { validUntil: { [sequelize_1.Op.gte]: validFrom } },
                ],
            },
            transaction,
        });
        // 2. Insertar las nuevas
        const creadas = yield models_1.ScheduleRule.bulkCreate(normalizadas, { transaction });
        yield transaction.commit();
        return res.status(200).json({
            ok: true,
            msg: 'Horario semanal actualizado con éxito',
            scheduleRules: creadas,
        });
    }
    catch (error) {
        yield transaction.rollback();
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al guardar el horario semanal',
            details: error.message,
        });
    }
});
exports.replaceWeek = replaceWeek;
const updateScheduleRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const error = (0, scheduleValidation_1.validarRegla)(req.body);
        if (error) {
            return res.status(400).json({ ok: false, msg: error });
        }
        const [filas, actualizadas] = yield models_1.ScheduleRule.update(req.body, {
            where: { id },
            returning: true,
        });
        if (filas === 0) {
            return res
                .status(404)
                .json({ ok: false, msg: 'Regla de horario no encontrada' });
        }
        return res.status(200).json({
            ok: true,
            msg: 'Horario actualizado con éxito',
            scheduleRule: actualizadas[0],
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al actualizar la regla de horario',
            details: error.message,
        });
    }
});
exports.updateScheduleRule = updateScheduleRule;
const deleteScheduleRule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        if (!(0, scheduleValidation_1.esUuidValido)(id)) {
            return res.status(400).json({
                ok: false,
                msg: 'El identificador de la regla no es válido',
            });
        }
        const borradas = yield models_1.ScheduleRule.destroy({ where: { id } });
        if (borradas === 0) {
            return res
                .status(404)
                .json({ ok: false, msg: 'Regla de horario no encontrada' });
        }
        return res
            .status(200)
            .json({ ok: true, msg: 'Horario eliminado con éxito', id });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error al eliminar la regla de horario',
            details: error.message,
        });
    }
});
exports.deleteScheduleRule = deleteScheduleRule;
//# sourceMappingURL=scheduleRule.js.map