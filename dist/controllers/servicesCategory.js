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
exports.createCategory = exports.getServicesCategory = void 0;
const servicesCategory_1 = __importDefault(require("../models/servicesCategory"));
const getServicesCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const serCat = yield servicesCategory_1.default.findAll();
        if (!serCat) {
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error del servidor'
        });
    }
});
exports.getServicesCategory = getServicesCategory;
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (name === '') {
        return res.status(401).json({
            ok: false,
            msg: 'El nombre no puede estar vacío'
        });
    }
    try {
        const categoryExist = yield servicesCategory_1.default.findOne({ where: { name } });
        if (categoryExist) {
            return res.status(404).json({
                ok: false,
                msg: 'Ya existe una categoría con ese nombre'
            });
        }
        // category = 
    }
    catch (error) {
        console.error(error);
    }
});
exports.createCategory = createCategory;
//# sourceMappingURL=servicesCategory.js.map