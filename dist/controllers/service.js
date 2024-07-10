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
exports.updateservice = exports.createService = exports.getServicesById = exports.getServicesByCategory = exports.getServices = void 0;
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
const getServicesByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield models_1.Service.findAll({
            where: { services_category_id: id },
        });
        if (!services) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron clientes',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
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
exports.getServicesByCategory = getServicesByCategory;
const getServicesById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield models_1.Service.findByPk(id);
        if (!services) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron clientes',
            });
        }
        return res.status(200).json({
            ok: true,
            services,
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
exports.getServicesById = getServicesById;
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
const updateservice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    let service = yield models_1.Service.findByPk(id);
    if (!service) {
        return res.status(400).json({
            ok: false,
            msg: 'No se encontró este servicio',
        });
    }
    const [updatedRowsCount, updateService] = yield models_1.Service.update(body, {
        where: { id },
        returning: true,
    });
    if (updatedRowsCount === 0 || !updateService || updateService.length === 0) {
        return res.status(404).json({
            ok: false,
            msg: 'Cliente no encontrado o no actualizado',
        });
    }
    res.status(201).json({
        ok: true,
        msg: 'Servicio actualizado correctamente',
        service: updateService[0],
    });
});
exports.updateservice = updateservice;
//# sourceMappingURL=service.js.map