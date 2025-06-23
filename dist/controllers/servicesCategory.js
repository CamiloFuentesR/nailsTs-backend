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
exports.updateServicesCategory = exports.showServiceCategoryById = exports.createServicesCategory = exports.getServicesCategory = void 0;
const models_1 = require("../models");
const getServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serCat = yield models_1.ServicesCategory.findAll();
        if (serCat.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Servicios_categorias - no se encontraron resultados',
            });
        }
        res.status(200).json({
            ok: true,
            serCat,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor',
        });
    }
});
exports.getServicesCategory = getServicesCategory;
const createServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const name = (_a = req.body.name) === null || _a === void 0 ? void 0 : _a.toUpperCase();
    if (!name || name.trim() === '') {
        return res.status(400).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    try {
        const categoryExist = yield models_1.ServicesCategory.findOne({ where: { name } });
        if (categoryExist) {
            return res.status(409).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre',
            });
        }
        // Asigna valores predeterminados a los campos obligatorios
        const data = {
            name,
            state: req.body.state || 'active', // Valor predeterminado si no se envía
            information: req.body.information || null, // Campo opcional
            img: req.body.img.name || null, // Campo opcional
        };
        console.log('data', data);
        const category = yield models_1.ServicesCategory.create(data);
        res.status(201).json({
            ok: true,
            category,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: 'Error al crear la categoría',
        });
    }
});
exports.createServicesCategory = createServicesCategory;
const showServiceCategoryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield models_1.ServicesCategory.findByPk(id);
        if (!category) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron categorias',
            });
        }
        return res.status(200).json({
            ok: true,
            category,
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
exports.showServiceCategoryById = showServiceCategoryById;
const updateServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    // Buscar la categoría del servicio
    const serCat = yield models_1.ServicesCategory.findByPk(id);
    // Si no existe el servicio, devolver un error
    if (!serCat) {
        return res.status(401).json({
            ok: false,
            msg: 'Servicio_categoria - no existe',
        });
    }
    if (Number(body.state) === 1) {
        body.state = true;
    }
    else if (Number(body.state) === 2) {
        body.state = false;
    }
    else if (typeof body.state === 'string') {
        body.state = body.state.toLowerCase() === 'true';
    }
    // Eliminar el ID del body para la actualización
    const { id: _ } = body, bodyWithoutId = __rest(body, ["id"]);
    // Actualizar la categoría del servicio
    const [updatedRowsCount, updatedServiceCategoryArray] = yield models_1.ServicesCategory.update(bodyWithoutId, {
        where: { id },
        returning: true,
    });
    // Verificar si se actualizó el servicio
    if (updatedRowsCount === 0) {
        return res.status(404).json({
            ok: false,
            msg: 'Servicio no encontrado o no actualizado',
        });
    }
    // Devolver la respuesta con el servicio actualizado
    return res.status(200).json({
        ok: true,
        body: updatedServiceCategoryArray,
    });
});
exports.updateServicesCategory = updateServicesCategory;
//# sourceMappingURL=servicesCategory.js.map