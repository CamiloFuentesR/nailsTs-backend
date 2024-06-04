import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import { UUIDVersion } from 'express-validator/lib/options';
import User from './user';
import Appointment from './appointment';

interface ClientAttributes {
  id: UUIDVersion;
  name: string;
  phone_number: number;
  user_id: UUIDVersion;
  state: boolean;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, 'id'> { }

export interface ClientInstance extends Model<ClientAttributes, ClientCreationAttributes>, ClientAttributes { }

const Client = db.define<ClientInstance>('Clients', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
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
Client.hasOne(User, { foreignKey: 'user_id' });
export default Client;