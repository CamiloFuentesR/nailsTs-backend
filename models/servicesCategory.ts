import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';

// Definición de las propiedades del modelo
export interface ServiceCategoryProps {
  id: number;
  name: string;
  state: boolean;
  information: string;
  img: string;
  /** Lo que trae el servicio, un item por linea. null si todavia no se llena. */
  incluye: string[] | null;
  /**
   * Dos categorias con el mismo grupo son excluyentes: se elige una. Sin grupo
   * (null), o con grupos distintos, se pueden combinar.
   */
  grupo: string | null;
}

// Definición de las propiedades requeridas al crear una instancia (excluyendo `id` porque es autoincremental)
export interface ServiceCategoryCreationAttributes
  extends Optional<ServiceCategoryProps, 'id' | 'incluye' | 'grupo'> {}

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
    /*
     * JSONB y no una tabla aparte: es una lista corta de texto que solo se lee
     * completa, nunca se consulta ni se ordena por sus elementos. Una tabla
     * hija seria mas peso del que resuelve.
     * La columna la agrega helpers/ensureCategoryColumns al arrancar.
     */
    incluye: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null,
    },
    /*
     * Que categorias se pisan entre si. Dos categorias con el mismo grupo son
     * excluyentes: se elige una. Sin grupo, o con grupos distintos, se pueden
     * combinar.
     *
     * Es texto libre y no un enum ni una tabla aparte: los grupos los define la
     * administradora desde el panel y son un puñado. Un enum obligaria a tocar
     * codigo cada vez que aparece una linea nueva de servicios.
     *
     * Nullable y sin defaultValue: sin grupo es el caso normal (retiro,
     * parafinoterapia, lifting de pestañas se combinan con todo) y solo las
     * categorias que compiten por el mismo lugar llevan un valor.
     *
     * La columna la agrega helpers/ensureCategoryColumns al arrancar.
     */
    grupo: {
      type: DataTypes.STRING(40),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: false, // Desactiva las marcas de tiempo automáticas
  },
);

export default ServicesCategory;
