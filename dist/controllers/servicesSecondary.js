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
exports.updateserviceSecondary = exports.getServicesSecondaryById = exports.getServicesSecondaryByCategory = exports.getServicesSecondary = exports.createServiceSecondary = void 0;
const serviceSecondary_1 = __importDefault(require("../models/serviceSecondary"));
const createServiceSecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, category_secondary_id, duration } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío',
        });
    }
    else if (category_secondary_id === '') {
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
        const categorySecondaryExist = yield serviceSecondary_1.default.findOne({
            where: { name },
        });
        if (categorySecondaryExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre',
            });
        }
        const data = {
            name,
            price,
            duration,
            category_secondary_id,
        };
        const serviceSecondary = yield serviceSecondary_1.default.create(data);
        res.status(201).json({
            ok: true,
            serviceSecondary,
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
exports.createServiceSecondary = createServiceSecondary;
const getServicesSecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield serviceSecondary_1.default.findAll();
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
exports.getServicesSecondary = getServicesSecondary;
const getServicesSecondaryByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield serviceSecondary_1.default.findAll({
            where: { category_secondary_id: id },
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
exports.getServicesSecondaryByCategory = getServicesSecondaryByCategory;
const getServicesSecondaryById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const services = yield serviceSecondary_1.default.findByPk(id);
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
exports.getServicesSecondaryById = getServicesSecondaryById;
const updateserviceSecondary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { body } = req;
    let service = yield serviceSecondary_1.default.findByPk(id);
    if (!service) {
        return res.status(400).json({
            ok: false,
            msg: 'No se encontró este servicio',
        });
    }
    const [updatedRowsCount, updateService] = yield serviceSecondary_1.default.update(body, {
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
exports.updateserviceSecondary = updateserviceSecondary;
//# sourceMappingURL=servicesSecondary.js.map