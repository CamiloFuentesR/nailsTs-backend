import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import Service from './service';
import ServicesCategory from './servicesCategory';
import { UUIDVersion } from 'express-validator/lib/options';

export interface AppointmentProps {
  id: UUIDVersion;
  start: Date;
  end: Date;
  price: number;
  client_id: UUIDVersion;
  backgroundColor: string;
  className: string;
  service_id: number;
  category_id: number;
  service_type: string;
  state: number;
  title: string;
}

interface AppointmentCreationAttributes
  extends Optional<AppointmentProps, 'id'> {}

export interface AppointmentInstance
  extends Model<AppointmentProps, AppointmentCreationAttributes>,
    AppointmentProps {}

const Appointment = db.define<AppointmentInstance>('Appointments', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.UUID,
    allowNull: false,
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
  // time: {
  //   type: DataTypes.DATE,
  //   allowNull: false,
  // },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service_type: {
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
    allowNull: false,
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Service,
      key: 'id',
    },
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServicesCategory,
      key: 'id',
    },
  },
});

export default Appointment;
