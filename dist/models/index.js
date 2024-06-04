"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appointment_1 = __importDefault(require("./appointment"));
const role_1 = __importDefault(require("./role"));
const server_1 = __importDefault(require("./server"));
const service_1 = __importDefault(require("./service"));
const user_1 = __importDefault(require("./user"));
const client_1 = __importDefault(require("./client"));
exports.default = {
    Appointment: appointment_1.default,
    Client: client_1.default,
    Server: server_1.default,
    Service: service_1.default,
    Role: role_1.default,
    User: user_1.default,
};
//# sourceMappingURL=index.js.map