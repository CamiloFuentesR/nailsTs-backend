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
const cors_1 = __importDefault(require("cors"));
const conection_1 = __importDefault(require("../db/conection"));
const errorHandler_1 = require("../middleware/errorHandler");
const speed_insights_1 = require("@vercel/speed-insights");
const routes_1 = require("../routes");
(0, speed_insights_1.injectSpeedInsights)();
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
            businessHour: '/api/businessHour',
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        const whiteList = ['https://nails-ts-backend.vercel.app'] && [
            'http://localhost:3000',
        ];
        const corsOptions = {
            origin: (origin, callbaback) => {
                const existe = whiteList.some(dominio => dominio === origin);
                if (existe) {
                    callbaback(null, true);
                }
                else {
                    callbaback(new Error('No permitido por cors'));
                }
            },
        };
        this.dBConection();
        this.middlewares();
        this.routes();
        // Error handler middleware
        this.app.use(errorHandler_1.errorHandler);
    }
    // Conexión a la base de datos
    dBConection() {
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
        // Habilitar CORS
        this.app.use((0, cors_1.default)());
        // Parseo del cuerpo de la solicitud
        this.app.use(express_1.default.json());
        // Carpeta pública
        this.app.use(express_1.default.static('public'));
    }
    // Definición de rutas
    routes() {
        this.app.use(this.apiPaths.auth, routes_1.authRoutes);
        this.app.use(this.apiPaths.category, routes_1.services);
        this.app.use(this.apiPaths.client, routes_1.clientRoutes);
        this.app.use(this.apiPaths.serviceCategory, routes_1.servicesCategory);
        this.app.use(this.apiPaths.users, routes_1.userRoutes);
        this.app.use(this.apiPaths.role, routes_1.roleRoutes);
        this.app.use(this.apiPaths.appointment, routes_1.appointmentRoutes);
        this.app.use(this.apiPaths.appointmentState, routes_1.appointmentStateRoutes);
        this.app.use(this.apiPaths.businessHour, routes_1.businessHourRoutes);
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