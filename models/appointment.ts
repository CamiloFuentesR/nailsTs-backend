import { DataTypes } from 'sequelize';
import db from '../db/conection';
import Client from './client'; // Importa el modelo Client si es necesario

const Appointment = db.define('Appointments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_appointment: {
    type: DataTypes.DATE,
    allowNull: false
  },
  time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  service_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

// Definir la relación con Client
// Appointment.belongsTo(Client, { foreignKey: 'client_id' });

export default Appointment;
