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
exports.updateServicesCategory = exports.createServicesCategory = exports.getServicesCategory = void 0;
const servicesCategory_1 = __importDefault(require("../models/servicesCategory"));
const getServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serCat = yield servicesCategory_1.default.findAll();
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
    const name = req.body.name.toUpperCase();
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    try {
        const categoryExist = yield servicesCategory_1.default.findOne({ where: { name } });
        if (categoryExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre',
            });
        }
        const data = {
            name,
        };
        const category = yield servicesCategory_1.default.create(data);
        res.status(201).json({
            ok: true,
            category,
        });
    }
    catch (error) {
        console.error(error);
    }
});
exports.createServicesCategory = createServicesCategory;
const updateServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    const serCat = yield servicesCategory_1.default.findByPk(id);
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