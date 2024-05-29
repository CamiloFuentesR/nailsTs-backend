import express, { Application } from 'express'
import userRoutes from '../routes/user';
import authRoutes from '../routes/auth';
import cors from 'cors'

import db from '../db/conection'

class Server {

    private app: Application;
    private port: string;
    private apiPaths = {
        users: '/api/users',
        auth: '/api/login'
    }

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
            throw new Error(error)
        }
    }

    middlewares() {
        //cors
        this.app.use(cors())
        //ready body
        this.app.use(express.json());
        //public folder
        this.app.use(express.static('public'));

    }
    routes() {
        this.app.use(this.apiPaths.users, userRoutes);
        this.app.use(this.apiPaths.auth, authRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo el puerto: ' + this.port);
        })
    }
}

export default Server;