import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';

export interface AppointmentProps extends Model {
  id: number;
  date_appointment: Date;
  price: number;
  time: Date;
  services_category_id: number;
  service_type: string;
  state: boolean;
}

const Appointment = db.define<AppointmentProps>('Appointments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  date_appointment: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  service_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Definir la relación con Client
// Appointment.belongsTo(Client, { foreignKey: 'client_id' });

export default Appointment;
