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
exports.createService = exports.getServices = void 0;
const models_1 = require("../models");
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield models_1.Service.findAll();
        if (services.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Servicios - no se encontraron servicios',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: error,
        });
    }
});
exports.getServices = getServices;
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, services_category_id } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    else if (services_category_id === '') {
        return res.status(401).json({
            ok: false,
            msg: 'La descripción no puede estar vacío',
        });
    }
    else if (price === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El precio no puede estar vacío',
        });
    }
    try {
        const categoryExist = yield models_1.Service.findOne({ where: { name } });
        if (categoryExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre',
            });
        }
        const data = {
            name,
            price,
            services_category_id,
        };
        const service = yield models_1.Service.create(data);
        res.status(201).json({
            ok: true,
            service,
        });
    }
    catch (error) {
        console.error(error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(500).json({
                ok: false,
                msg: 'La categoria-servicio no existe, contacte con el administrador',
            });
        }
        return res.status(500).json({
            ok: false,
            msg: 'Server internal error',
        });
    }
});
exports.createService = createService;
//# sourceMappingURL=service.js.map