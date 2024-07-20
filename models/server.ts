import express, { Application } from 'express';
import { createServer } from 'http';
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
  private server: any; // Servidor HTTP
  private io: any; // Instancia de Socket.io

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';
    this.server = createServer(this.app); // Crear servidor HTTP
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: [
          'https://nails-ts-backend.vercel.app',
          'http://localhost:3000',
          'https://mozzafiato-manicure.netlify.app',
        ], // Cambia esto según tus necesidades
        methods: ['GET', 'POST', 'PUT'],
      },
    });

    const whiteList = [
      'https://nails-ts-backend.vercel.app',
      'http://localhost:3000',
      'https://mozzafiato-manicure.netlify.app',
    ];
    const corsOptions = {
      origin: (origin: any, callback: any) => {
        const existe = whiteList.some(dominio => dominio === origin);
        if (existe) {
          callback(null, true);
        } else {
          callback(new Error('No permitido por cors'));
        }
      },
    };

    this.dBConection();
    this.middlewares();
    this.routes();
    this.sockets(); // Configurar Socket.io

    // Error handler middleware
    this.app.use(errorHandler);
  }

  // Conexión a la base de datos
  private async dBConection(): Promise<void> {
    try {
      await db.authenticate();
      console.log('DB online');
    } catch (error: any) {
      console.error('Error connecting to the database:', error);
      throw new Error(error.message || 'Error connecting to the database');
    }
  }

  // Configuración de middlewares
  private middlewares(): void {
    // Habilitar CORS
    this.app.use(cors());
    // Parseo del cuerpo de la solicitud
    this.app.use(express.json());
    // Carpeta pública
    this.app.use(express.static('public'));
  }

  // Definición de rutas
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

  // Configuración de Socket.io
  private sockets(): void {
    this.io.on('connection', (socket: any) => {
      console.log('New client connected');

      socket.on('event-update', (data: any) => {
        console.log('Event update received:', data);
        this.io.emit('event-update', data); // Enviar la actualización a todos los clientes
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });
  }

  // Método para iniciar el servidor
  public listen(): void {
    this.server.listen(this.port, () => {
      console.log('Servidor corriendo en el puerto: ' + this.port);
    });
  }
}

export default Server;
