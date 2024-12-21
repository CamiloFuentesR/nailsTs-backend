import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';

// Definición de las propiedades del modelo
export interface ServiceCategoryProps {
  id: number;
  name: string;
  state: boolean;
  information: string;
  img: string;
}

// Definición de las propiedades requeridas al crear una instancia (excluyendo `id` porque es autoincremental)
export interface ServiceCategoryCreationAttributes
  extends Optional<ServiceCategoryProps, 'id'> {}

// Definición de la instancia del modelo, extendiendo `Model` con los tipos definidos
export interface ServiceCategoryInstance
  extends Model<ServiceCategoryProps, ServiceCategoryCreationAttributes>,
    ServiceCategoryProps {}

// Definición del modelo en Sequelize
const ServicesCategory = db.define<ServiceCategoryInstance>(
  'services_category',
  {
    id: {
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
    information: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
  },
);

export default ServicesCategory;
