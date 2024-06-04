import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import User from './user';

interface RoleAttributes {
  id: number;
  name:string;
}

interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'name' > { }

export interface RoleInstance extends Model<RoleAttributes, RoleCreationAttributes>, RoleAttributes { }
const Role = db.define<RoleInstance>('Roles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Role;

// Role.belongsTo(User, { foreignKey: 'role_id' });