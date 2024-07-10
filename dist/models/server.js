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
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("../routes/user"));
const auth_1 = __importDefault(require("../routes/auth"));
const appointment_1 = __importDefault(require("../routes/appointment"));
const appointmentState_1 = __importDefault(require("../routes/appointmentState"));
const client_1 = __importDefault(require("../routes/client"));
const roles_1 = __importDefault(require("../routes/roles"));
const services_category_1 = __importDefault(require("../routes/services_category"));
const services_1 = __importDefault(require("../routes/services"));
const cors_1 = __importDefault(require("cors"));
const conection_1 = __importDefault(require("../db/conection"));
const errorHandler_1 = require("../middleware/errorHandler");
class Server {
    constructor() {
        this.apiPaths = {
            users: '/api/users',
            auth: '/api/login',
            serviceCategory: '/api/ser-cat',
            category: '/api/services',
            client: '/api/clients',
            role: '/api/role',
            appointment: '/api/appointment',
            appointmentState: '/api/appointmentState',
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        const whiteList = ['http://localhost:3000'] && [
            'https://nails-ts-backend.vercel.app',
        ];
        const corsOptions = {
            origin: (origin, callbaback) => {
                //console.log(origin);
                const existe = whiteList.some(dominio => dominio === origin);
                if (existe) {
                    callbaback(null, true);
                }
                else {
                    callbaback(new Error('No permitido por cors'));
                }
            },
        };
        this.dBConection(corsOptions);
        this.middlewares();
        this.routes();
        // Error handler middleware
        this.app.use(errorHandler_1.errorHandler);
    }
    // Conexión a la base de datos
    dBConection(corsOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield conection_1.default.authenticate();
                console.log('DB online');
            }
            catch (error) {
                console.error('Error connecting to the database:', error);
                throw new Error(error.message || 'Error connecting to the database');
            }
        });
    }
    // Configuración de middlewares
    middlewares() {
        //cors
        // Habilitar CORS
        // this.app.use(cors());
        this.app.use((0, cors_1.default)());
        // Parseo del cuerpo de la solicitud
        this.app.use(express_1.default.json());
        // Carpeta pública
        this.app.use(express_1.default.static('public'));
    }
    // Definición de rutas
    routes() {
        this.app.use(this.apiPaths.auth, auth_1.default);
        this.app.use(this.apiPaths.category, services_1.default);
        this.app.use(this.apiPaths.client, client_1.default);
        this.app.use(this.apiPaths.serviceCategory, services_category_1.default);
        this.app.use(this.apiPaths.users, user_1.default);
        this.app.use(this.apiPaths.role, roles_1.default);
        this.app.use(this.apiPaths.appointment, appointment_1.default);
        this.app.use(this.apiPaths.appointmentState, appointmentState_1.default);
    }
    // Método para iniciar el servidor
    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto: ' + this.port);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map