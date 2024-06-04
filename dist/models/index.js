"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.Role = exports.Service = exports.Server = exports.Client = exports.Appointment = void 0;
const appointment_1 = __importDefault(require("./appointment"));
exports.Appointment = appointment_1.default;
const role_1 = __importDefault(require("./role"));
exports.Role = role_1.default;
const server_1 = __importDefault(require("./server"));
exports.Server = server_1.default;
const service_1 = __importDefault(require("./service"));
exports.Service = service_1.default;
const user_1 = __importDefault(require("./user"));
exports.User = user_1.default;
const client_1 = __importDefault(require("./client"));
exports.Client = client_1.default;
//# sourceMappingURL=index.js.map