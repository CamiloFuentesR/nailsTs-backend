import { DataTypes } from 'sequelize';
import db from '../db/conection';
import ServicesCategory from './servicesCategory';

const Service = db.define('Services', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  services_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServicesCategory,
      key: 'services_category_id'
    }
  }
});

Service.belongsTo(ServicesCategory, { foreignKey: 'services_category_id' });

export default Service;
