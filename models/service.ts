import { DataTypes, Model } from 'sequelize';
import db from '../db/conection';
import ServicesCategory from './servicesCategory';

export interface Service extends Model {
  id: number;
  name: string;
  price: number;
  state: boolean;
  duration: number | null;
  /** true = se suma a otro servicio; false = se ofrece como servicio principal. */
  es_complemento: boolean;
  services_category_id: number;
}
const Service = db.define<Service>('Services', {
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
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  /*
   * Separa los servicios que se piden solos de los que se agregan a otro: el
   * retiro, la parafinoterapia, los largos adicionales de uña o el parche por
   * uña no son una cita, son un extra de la cita.
   *
   * Va por servicio y no por categoría porque dentro de una misma categoría
   * conviven las dos cosas (en POLYGEL están la extensión y los largos M y L).
   * Con la marca acá, qué categorías se ofrecen como opción principal se
   * deduce: son las que tienen al menos un servicio sin marcar.
   *
   * La columna la agrega helpers/ensureServiceColumns al arrancar.
   */
  es_complemento: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  services_category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServicesCategory,
      key: 'id',
    },
  },
});

export default Service;
