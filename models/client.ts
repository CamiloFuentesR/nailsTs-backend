import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';
import User from './user'; // Importa el modelo de User
import Appointment from './appointment';
import { UUIDVersion } from 'express-validator/lib/options';
interface ClientAttributes {
  // Otras propiedades
  id: number;
  name: string;
  phone_number: number;
  user_id: UUIDVersion;
  state: boolean;
}

interface ClientInstance extends Model<ClientAttributes>, ClientAttributes {
  // Otras definiciones si las hay
}
const Client = db.define<ClientInstance>('Clients', {
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
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

Client.hasMany(Appointment, { foreignKey: 'cliente_id' });

export default Client;
