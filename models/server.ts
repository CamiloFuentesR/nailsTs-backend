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
  appointmentServiceRoute,
  authRoutes,
  businessHourRoutes,
  clientRoutes,
  roleRoutes,
  services,
  servicesCategory,
  userRoutes,
  servicesCategorySecondaryRoutes,
  servicesSecondaryRoutes,
  fileUploadTo,
  googleAnalytics,
  scheduleRuleRoutes,
  scheduleExceptionRoutes,
} from '../routes';
import fileUpload from 'express-fileupload';
import { ensureScheduleTables } from '../helpers/ensureScheduleTables';
import { ensureCategoryColumns } from '../helpers/ensureCategoryColumns';
import { ensureServiceColumns } from '../helpers/ensureServiceColumns';
import { ensureNoOverlapConstraint } from '../helpers/ensureNoOverlapConstraint';

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
    categorySecondary: '/api/categorySecondary',
    serviceSecondary: '/api/serviceSecondary',
    appointmentServoce: '/api/appointmentService',
    fileUpload: '/api/upload',
    googleAnalisis: '/api/googleAnatytics',
    scheduleRule: '/api/scheduleRule',
    scheduleException: '/api/scheduleException',
  };

  constructor() {
    this.app = express();
    this.port = process.env.PORT || '8000';

    // Crear el servidor HTTP
    this.server = http.createServer(this.app);

    // Inicializar Socket.io con el servidor HTTP
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: [
          'https://mozzafiato-manicure.netlify.app',
          'https://mozzafiato-manicure.cl',
          'https://www.mozzafiato-manicure.cl',
          'http://localhost:5173',
          'http://localhost:4173',
        ],
        // origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

    // Crea las tablas de horarios si faltan. Koyeb corre un contenedor
    // persistente, así que esto se ejecuta una vez por deploy, no por request.
    // Va aparte del authenticate: si falla, el servidor igual debe levantar.
    try {
      await ensureScheduleTables();
    } catch (error: any) {
      console.error(
        'No se pudieron verificar las tablas de horarios:',
        error.message,
      );
    }

    // Mismo criterio: si falla, el servidor igual levanta. Sin la columna, la
    // ficha del servicio simplemente no muestra el bloque "Que incluye".
    try {
      await ensureCategoryColumns();
    } catch (error: any) {
      console.error(
        'No se pudieron verificar las columnas de categorias:',
        error.message,
      );
    }

    // Igual que los de arriba: si falla, el servidor levanta lo mismo. Sin la
    // columna, todos los servicios se siguen ofreciendo como principales, que
    // es el comportamiento de siempre.
    try {
      await ensureServiceColumns();
    } catch (error: any) {
      console.error(
        'No se pudieron verificar las columnas de servicios:',
        error.message,
      );
    }

    // Refuerza en la base la validación de solape que ya hace el controlador.
    // No lleva try/catch como los dos de arriba porque el helper maneja sus
    // propios errores y nunca lanza: si la tabla ya trae citas solapadas, deja
    // el motivo en el log y el servidor levanta igual.
    await ensureNoOverlapConstraint();
  }

  private middlewares(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
        createParentPath: true,
      }),
    );
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
    this.app.use(
      this.apiPaths.categorySecondary,
      servicesCategorySecondaryRoutes,
    );
    this.app.use(this.apiPaths.serviceSecondary, servicesSecondaryRoutes);
    this.app.use(this.apiPaths.appointmentServoce, appointmentServiceRoute);
    this.app.use(this.apiPaths.fileUpload, fileUploadTo);
    this.app.use(this.apiPaths.googleAnalisis, googleAnalytics);
    this.app.use(this.apiPaths.scheduleRule, scheduleRuleRoutes);
    this.app.use(this.apiPaths.scheduleException, scheduleExceptionRoutes);
  }
  private sockets(): void {
    this.io.on('connection', socket => {
      console.log('Cliente conectado');

      socket.on('saveAppointment', event => {
        console.log('Evento agregado:', event);
        // Aquí podrías guardar el evento en la base de datos
        socket.broadcast.emit('savedAppointment', event); // Emitir a todos los clientes
      });

      socket.on('updateAppointment', event => {
        if (event.img instanceof Buffer) {
          event.img = `data:image/jpeg;base64,${event.img.toString('base64')}`;
        }
        console.log('Evento actualizado:', event);
        socket.broadcast.emit('updatedAppointment', event);
      });

      socket.on('eventDeleted', event => {
        console.log('Evento eliminado:', event);

        socket.broadcast.emit('eventDeleted', event); // Emitir a todos los clientes
      });

      socket.on('saveBussines', businessHours => {
        console.log('Hora de negocio agregada:', businessHours);
        socket.broadcast.emit('onAddNewBusiness', businessHours);
      });

      socket.on('updateBussines', businessHours => {
        console.log('Hora de negocio editada:', businessHours);
        socket.broadcast.emit('onUpdateBusiness', businessHours);
      });

      socket.on('deleteBussines', businessHourId => {
        console.log('Horario eliminado:', businessHourId);
        socket.broadcast.emit('onDeleteBusiness', businessHourId);
      });

      socket.on('saveScheduleRules', scheduleRules => {
        console.log('Horario semanal actualizado');
        socket.broadcast.emit('onScheduleRulesUpdated', scheduleRules);
      });

      socket.on('saveScheduleException', scheduleException => {
        console.log('Cierre agregado:', scheduleException);
        socket.broadcast.emit('onScheduleExceptionAdded', scheduleException);
      });

      socket.on('deleteScheduleException', scheduleExceptionId => {
        console.log('Cierre eliminado:', scheduleExceptionId);
        socket.broadcast.emit('onScheduleExceptionDeleted', scheduleExceptionId);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
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
