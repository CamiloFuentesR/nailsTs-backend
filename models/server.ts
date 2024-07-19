import express, { Application } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import db from '../db/conection';
import { errorHandler } from '../middleware/errorHandler';
import { injectSpeedInsights } from '@vercel/speed-insights';
import {
  appointmentRoutes,
  appointmentStateRoutes,
  authRoutes,
  businessHourRoutes,
  clientRoutes,
  roleRoutes,
  services,
  servicesCategory,
  userRoutes,
} from '../routes';

injectSpeedInsights();

class Server {
  private app: Application;
  private server: http.Server;
  private io: SocketIOServer;
  private port: string;
  private apiPaths = {
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

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';

    // Crear el servidor HTTP
    this.server = http.createServer(this.app);

    // Inicializar Socket.io con el servidor HTTP
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: 'https://mozzafiato-manicure.netlify.app',
        methods: ['GET', 'POST', 'PUT'],
      },
    });

    this.dBConection();
    this.middlewares();
    this.routes();
    this.sockets();

    // Error handler middleware
    this.app.use(errorHandler);
  }

  private async dBConection(): Promise<void> {
    try {
      await db.authenticate();
      console.log('DB online');
    } catch (error: any) {
      console.error('Error connecting to the database:', error);
      throw new Error(error.message || 'Error connecting to the database');
    }
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  private routes(): void {
    this.app.use(this.apiPaths.auth, authRoutes);
    this.app.use(this.apiPaths.category, services);
    this.app.use(this.apiPaths.client, clientRoutes);
    this.app.use(this.apiPaths.serviceCategory, servicesCategory);
    this.app.use(this.apiPaths.users, userRoutes);
    this.app.use(this.apiPaths.role, roleRoutes);
    this.app.use(this.apiPaths.appointment, appointmentRoutes);
    this.app.use(this.apiPaths.appointmentState, appointmentStateRoutes);
    this.app.use(this.apiPaths.businessHour, businessHourRoutes);
  }
  private sockets(): void {
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
        this.io.emit('eventDeleted', data);
      });

      console.log('New client connected');
      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  public listen(): void {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en el puerto: ' + this.port);
    });
  }
}

export default Server;
