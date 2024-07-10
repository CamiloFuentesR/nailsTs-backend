import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';

export interface AppointmentStateProps extends Model {
  id: number;
  name: string;
}
const AppointmentSate = db.define<AppointmentStateProps>(
  'Appointments_states',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
  },
);

export default AppointmentSate;
