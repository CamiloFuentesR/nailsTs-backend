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
exports.updateService = exports.createService = exports.getServicesById = exports.getServicesByCategory = exports.getServices = void 0;
const models_1 = require("../models");
const getServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield models_1.Service.findAll({
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
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
            where: { services_category_id: id, state: true },
        });
        if (!services) {
            return res.status(409).json({
                ok: false,
                msg: 'No se encontraron servicios',
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
                msg: 'No se encontraron servicios',
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
    const { name, price, services_category_id, duration } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    else if (services_category_id === '') {
        return res.status(401).json({
            ok: false,
            msg: 'La id no puede estar vacía',
        });
    }
    else if (price === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El precio no puede estar vacío',
        });
    }
    try {
        const serviceExist = yield models_1.Service.findOne({ where: { name } });
        if (serviceExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe un servicio con ese nombre',
            });
        }
        const data = {
            name,
            price,
            duration,
            state: true,
            services_category_id,
        };
        const service = yield models_1.Service.create(data);
        // Consulta el servicio recién creado para incluir la categoría
        const serviceWithCategory = yield models_1.Service.findByPk(service.id, {
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
        return res.status(201).json({
            ok: true,
            service: serviceWithCategory,
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
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    let { body } = req;
    if (body.state === 1) {
        body.state = true;
    }
    else if (body.state === 2) {
        body.state = false;
    }
    // Crear una copia del cuerpo y excluir el campo `id`
    const { id: _ } = body, bodyWithoutId = __rest(body, ["id"]);
    try {
        // Buscar el servicio por su id
        let service = yield models_1.Service.findByPk(id);
        if (!service) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encontró este servicio',
            });
        }
        // Actualizar el servicio con los nuevos datos
        const [updatedRowsCount] = yield models_1.Service.update(bodyWithoutId, {
            where: { id },
        });
        // Verificar si la actualización se realizó correctamente
        if (updatedRowsCount === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'Servicio no encontrado o no actualizado',
            });
        }
        // Obtener el servicio actualizado con su categoría
        const updatedService = yield models_1.Service.findByPk(id, {
            include: [
                {
                    model: models_1.ServicesCategory,
                    as: 'category',
                },
            ],
        });
        return res.status(201).json({
            ok: true,
            msg: 'Servicio actualizado correctamente',
            service: updatedService,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor',
        });
    }
});
exports.updateService = updateService;
//# sourceMappingURL=service.js.map