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
exports.createAppointmentState = void 0;
const appointmentState_1 = __importDefault(require("../models/appointmentState"));
const createAppointmentState = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, name } = req.body;
    const appointmentState = yield appointmentState_1.default.findByPk(id);
    if (appointmentState) {
        return res.status(400).json({
            ok: false,
            msg: 'Este elemento esta duplicado',
        });
    }
    const appointmentStateSave = yield appointmentState_1.default.create({
        id,
        name,
    });
    res
        .status(201)
        .json({ ok: true, msg: 'Estado creado con éxito', appointmentStateSave });
});
exports.createAppointmentState = createAppointmentState;
//# sourceMappingURL=appointmentsState.js.map