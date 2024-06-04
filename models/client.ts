import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';
import Appointment from './appointment';
import { UUIDVersion } from 'express-validator/lib/options';
import User from './user';

interface ClientAttributes extends Model {
  // Otras propiedades
  id: UUIDVersion;
  name: string;
  phone_number: number;
  user_id: UUIDVersion;
  state: boolean;
}


const Client = db.define<ClientAttributes>('Clients', {
  id: {
    type: DataTypes.UUID,
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
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

Client.hasMany(Appointment, { foreignKey: 'cliente_id' });
// Client.hasOne(User,{foreignKey:'user_id'})
export default Client;
