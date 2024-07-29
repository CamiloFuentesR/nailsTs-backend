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
exports.updateServicesCategorySecondary = exports.showServiceCategorySecondaryById = exports.getServicesCategorySecondary = exports.createServicesCategorySecondary = void 0;
const models_1 = require("../models");
const createServicesCategorySecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const name = req.body.name.toUpperCase();
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    try {
        const categoryExist = yield models_1.ServicesCategorySecondary.findOne({
            where: { name },
        });
        if (categoryExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre',
            });
        }
        const data = {
            name,
        };
        const categorySecondary = yield models_1.ServicesCategorySecondary.create(data);
        res.status(201).json({
            ok: true,
            categorySecondary,
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.createServicesCategorySecondary = createServicesCategorySecondary;
const getServicesCategorySecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serCat = yield models_1.ServicesCategorySecondary.findAll();
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
exports.getServicesCategorySecondary = getServicesCategorySecondary;
const showServiceCategorySecondaryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const category = yield models_1.ServicesCategorySecondary.findByPk(id);
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
exports.showServiceCategorySecondaryById = showServiceCategorySecondaryById;
const updateServicesCategorySecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    const serCat = yield models_1.ServicesCategorySecondary.findByPk(id);
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
exports.updateServicesCategorySecondary = updateServicesCategorySecondary;
//# sourceMappingURL=serviceCategorySecondary.js.map