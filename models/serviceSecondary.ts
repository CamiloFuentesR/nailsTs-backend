import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';
import ServicesCategorySecondary from './serviceCategorySecondary';

export interface Service extends Model {
  id: number;
  name: string;
  price: number;
  state: boolean;
  duration: number;
  services_category_id: number;
}
const ServiceSecondary = db.define<Service>('Services_secondary', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  state: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  duration: {
    type: DataTypes.SMALLINT,
    allowNull: true,
  },
  category_secondary_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServicesCategorySecondary,
      key: 'id',
    },
  },
});

export default ServiceSecondary;
