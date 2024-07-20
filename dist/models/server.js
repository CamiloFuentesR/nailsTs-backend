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
        };
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || '443';
        // Crear el servidor HTTP
        this.server = http_1.default.createServer(this.app);
        // Inicializar Socket.io con el servidor HTTP
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: '*', // Permitir todas las conexiones para pruebas
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
    }
    sockets() {
        this.io.on('connection', socket => {
            console.log('New client connected');
            socket.on('eventAdded', data => {
                console.log('Event added:', data);
                // Emitir el evento a todos los clientes conectados
                this.io.emit('eventAdded', data);
            });
            socket.on('eventUpdated', data => {
                console.log('Event updated:', data);
                // Emitir el evento a todos los clientes conectados
                this.io.emit('eventUpdated', data);
            });
            socket.on('businessHourAdded', data => {
                console.log('Business added:', data);
                // Emitir el evento a todos los clientes conectados
                this.io.emit('businessHourAdded', data);
            });
            socket.on('eventLoaded', data => {
                console.log('Event loaded:', data);
                // Emitir el evento a todos los clientes conectados
                this.io.emit('eventLoaded', data);
            });
            socket.on('eventDeleted', data => {
                console.log('Event loaded:', data);
                // Emitir el evento a todos los clientes conectados
                this.io.emit('eventLoaded', data);
            });
            console.log('New client connected');
            socket.on('disconnect', () => {
                console.log('Client disconnected');
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