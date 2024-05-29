import { DataTypes } from 'sequelize';
import db from '../db/conection';

const Role = db.define('Roles', {
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