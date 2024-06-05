import express, { Application } from 'express';
import userRoutes from '../routes/user';
import authRoutes from '../routes/auth';
import clientRoutes from '../routes/client';
import roleRoutes from '../routes/roles';
import servicesCategory from '../routes/services_category';
import services from '../routes/services';
import cors from 'cors';
import db from '../db/conection';
import { errorHandler } from '../middleware/errorHandler';

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
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';

    this.dBConection();
    this.middlewares();
    this.routes();

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
  }

  // Método para iniciar el servidor
  public listen(): void {
    this.app.listen(this.port, () => {
      console.log('Servidor corriendo en el puerto: ' + this.port);
    });
  }
}

export default Server;
