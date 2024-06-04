import express, { Application } from 'express';
import userRoutes from '../routes/user';
import authRoutes from '../routes/auth';
import clientRoutes from '../routes/client';
import servicesCategory from '../routes/services_category';
import services from '../routes/services';
import cors from 'cors';

import db from '../db/conection';

class Server {
  private app: Application;
  private port: string;
  private apiPaths = {
    users: '/api/users',
    auth: '/api/login',
    serviceCategory: '/api/ser-cat',
    category: '/api/services',
    client: '/api/clients',
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';

    this.dBConection();
    this.middlewares();
    this.routes();
  }

  async dBConection() {
    try {
      await db.authenticate();
      console.log('DB online');
    } catch (error: any) {
      throw new Error(error);
    }
  }

  middlewares() {
    //cors
    this.app.use(cors());
    //ready body
    this.app.use(express.json());
    //public folder
    this.app.use(express.static('public'));
  }
  routes() {
    this.app.use(this.apiPaths.auth, authRoutes);
    this.app.use(this.apiPaths.category, services);
    this.app.use(this.apiPaths.client, clientRoutes);
    this.app.use(this.apiPaths.serviceCategory, servicesCategory);
    this.app.use(this.apiPaths.users, userRoutes);
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log('Servidor corriendo el puerto: ' + this.port);
    });
  }
}

export default Server;
