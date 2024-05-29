import { DataTypes } from 'sequelize';
import db from '../db/conection';
import User from './user'; // Importa el modelo de User
import Appointment from './appointment';

const Client = db.define('Clients', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: User,
      key: 'id'
    }
  }
});

// Definir la relación con User
// Client.belongsTo(User, { foreignKey: 'user_id' });
Client.hasMany(Appointment, { foreignKey: 'cliente_id' });

export default Client;
