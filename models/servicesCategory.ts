import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';

export interface ServiceCatProps extends Model {
  services_category_id: number;
  name: string;
  state: boolean;
}

const ServicesCategory = db.define<ServiceCatProps>(
  'services_category',
  {
    services_category_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    state: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
  },
  {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
  }
);

export default ServicesCategory;
