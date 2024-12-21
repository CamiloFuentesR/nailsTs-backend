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
            img: req.body.img || null, // Campo opcional
        };
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
    const serCat = yield models_1.ServicesCategory.findByPk(id);
    if (!serCat) {
        return res.status(401).json({
            ok: false,
            msg: 'Servicio_categoria - no exixte',
        });
    }
    return res.status(200).json({
        ok: true,
        serCat,
        body,
    });
});
exports.updateServicesCategory = updateServicesCategory;
//# sourceMappingURL=servicesCategory.js.map