import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import { UUIDVersion } from 'express-validator/lib/options';
import { ClientInstance } from './client';

export interface AppointmentProps {
  id: UUIDVersion;
  start: Date;
  end: Date;
  price: number;
  client_id: UUIDVersion;
  backgroundColor: string;
  className: string;
  img?: string;
  state: number;
  title: string;
}

interface AppointmentCreationAttributes
  extends Optional<AppointmentProps, 'id'> {}

export interface AppointmentInstance
  extends Model<AppointmentProps, AppointmentCreationAttributes>,
    AppointmentProps {
  client?: ClientInstance;
}

const Appointment = db.define<AppointmentInstance>('Appointments', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  start: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  backgroundColor: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  className: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default Appointment;
