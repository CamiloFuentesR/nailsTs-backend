import { DataTypes } from 'sequelize';
import db from '../db/conection';
import Client from './client'; // Importa el modelo Client si es necesario

const Appointment = db.define('Appointments', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
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
  status: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

// Definir la relación con Client
// Appointment.belongsTo(Client, { foreignKey: 'client_id' });

export default Appointment;
