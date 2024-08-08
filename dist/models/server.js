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
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
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
            categorySecondary: '/api/categorySecondary',
            serviceSecondary: '/api/serviceSecondary',
            appointmentServoce: '/api/appointmentService',
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '8000';
        // Crear el servidor HTTP
        this.server = http_1.default.createServer(this.app);
        // Inicializar Socket.io con el servidor HTTP
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: 'https://mozzafiato-manicure.netlify.app',
                // origin: 'http://localhost:3000',
                methods: ['GET', 'POST', 'PUT'],
            },
        });
        this.dBConection();
        this.middlewares();
        this.routes();
        this.sockets();
        // Error handler middleware
        this.app.use(errorHandler_1.errorHandler);
    }
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
    middlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.static('public'));
    }
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
        this.app.use(this.apiPaths.categorySecondary, routes_1.servicesCategorySecondaryRoutes);
        this.app.use(this.apiPaths.serviceSecondary, routes_1.servicesSecondaryRoutes);
        this.app.use(this.apiPaths.appointmentServoce, routes_1.appointmentServiceRoute);
    }
    sockets() {
        this.io.on('connection', socket => {
            console.log('Cliente conectado');
            socket.on('saveAppointment', event => {
                console.log('Evento agregado:', event);
                // Aquí podrías guardar el evento en la base de datos
                socket.broadcast.emit('savedAppointment', event); // Emitir a todos los clientes
            });
            socket.on('updateAppointment', event => {
                console.log('Evento actualizado:', event);
                // Aquí podrías actualizar el evento en la base de datos
                socket.broadcast.emit('updatedAppointment', event); // Emitir a todos los clientes
            });
            socket.on('historyEvent', event => {
                console.log('History actualizado:', event);
                // Aquí podrías actualizar el evento en la base de datos
                socket.broadcast.emit('historyEvent', event); // Emitir a todos los clientes
            });
            socket.on('eventDeleted', event => {
                console.log('Evento eliminado:', event);
                // Aquí podrías eliminar el evento de la base de datos
                socket.broadcast.emit('eventDeleted', event); // Emitir a todos los clientes
            });
            // socket.on('businessHourAdded', businessHour => {
            //   console.log('Hora de negocio agregada:', businessHour);
            //   // Aquí podrías guardar la hora de negocio en la base de datos
            //   socket.broadcast.emit('businessHourAdded', businessHour); // Emitir a todos los clientes
            // });
            // socket.on('businessHourUpdated', businessHour => {
            //   console.log('Hora de negocio actualizada:', businessHour);
            //   // Aquí podrías actualizar la hora de negocio en la base de datos
            //   socket.broadcast.emit('businessHourUpdated', businessHour); // Emitir a todos los clientes
            // });
            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });
        });
    }
    listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto: ' + this.port);
        });
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map