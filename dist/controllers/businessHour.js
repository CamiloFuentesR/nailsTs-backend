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
exports.getBusinessHourById = exports.updateBusinessHour = exports.getAllBusinessHours = exports.createBusinessHour = void 0;
const models_1 = require("../models");
const createBusinessHour = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { id } = _a, businessHourData = __rest(_a, ["id"]);
    try {
        const existingBusinessHour = yield models_1.BusinessHour.findByPk(id);
        console.log(existingBusinessHour);
        if (existingBusinessHour) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al crear el horario, datos duplicados',
            });
        }
        const businessHour = yield models_1.BusinessHour.create(Object.assign({ id }, businessHourData));
        res.status(201).json({
            ok: true,
            msg: 'Horario creado con éxito',
            businessHour,
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error al crear el horario',
            details: error.message,
        });
    }
});
exports.createBusinessHour = createBusinessHour;
const getAllBusinessHours = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const businessHours = yield models_1.BusinessHour.findAll();
        if (businessHours) {
            res.status(200).json({
                ok: true,
                msg: 'Se obtuvieron los horarios con éxito',
                businessHours,
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
exports.getAllBusinessHours = getAllBusinessHours;
const updateBusinessHour = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    try {
        const [updatedRowsCount, updatedBusinessHours] = yield models_1.BusinessHour.update(body, {
            where: { id },
            returning: true,
        });
        if (updatedRowsCount === 0 ||
            !updatedBusinessHours ||
            updatedBusinessHours.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Horario no encontrado o no actualizado',
            });
        }
        return res.status(200).json({
            ok: true,
            msg: 'Horario actualizado con éxito',
            businessHour: updatedBusinessHours[0],
        });
    }
    catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor al actualizar el horario',
            error: error.message,
        });
    }
});
exports.updateBusinessHour = updateBusinessHour;
const getBusinessHourById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const businessHour = yield models_1.BusinessHour.findByPk(id);
        if (!businessHour) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontró el horario',
            });
        }
        return res.status(200).json({
            ok: true,
            businessHour,
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
exports.getBusinessHourById = getBusinessHourById;
//# sourceMappingURL=businessHour.js.map