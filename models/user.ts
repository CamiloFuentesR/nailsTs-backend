import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import Role from './role';
import Client from './client';
import { UUIDVersion } from 'express-validator/lib/options';

interface Role {
  dataValues: object;
  name: string;
}

interface UserAttributes {
  id: UUIDVersion;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  state: boolean;
  role_id: number;
  Role?: Role;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    'id' | 'createdAt' | 'updatedAt' | 'state' | 'role_id'
  > {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

const User = db.define<UserInstance>('Users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2,
    references: {
      model: Role,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// Sobrescribir el método toJSON en el prototipo del modelo
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

User.belongsTo(Role, { foreignKey: 'role_id' });
User.hasOne(Client);

export default User;
