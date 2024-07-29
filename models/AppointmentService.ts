import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import Service from './service';
import { UUIDVersion } from 'express-validator/lib/options';
import Appointment from './appointment';

export interface AppointmentServiceProps {
  id: UUIDVersion;
  appointment_id: UUIDVersion;
  service_id: number;
  state: boolean;
  price: number;
}

interface AppointmentServiceCreationAttributes
  extends Optional<AppointmentServiceProps, 'id'> {}

export interface AppointmentServiceInstance
  extends Model<AppointmentServiceProps, AppointmentServiceCreationAttributes>,
    AppointmentServiceProps {}

const AppointmentService = db.define<AppointmentServiceInstance>(
  'appointment_services',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Appointment,
        key: 'id',
      },
    },
    state: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    price: {
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
  },
);

export default AppointmentService;
