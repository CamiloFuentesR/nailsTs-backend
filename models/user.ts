import { DataTypes } from 'sequelize';
import db from '../db/conection'; // Importa tu instancia de Sequelize
import Role from './role'; // Importa el modelo de Role si es necesario
import Client from './client';

const User = db.define('Users', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    // autoIncrement: true,
    references: {
      // model: Client,
      // key: 'user_id'
    }
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
  },
  role_id:{
    type: DataTypes.INTEGER,
    allowNull:false,
    references:{
      model:Role,
      key:'id'
    }

  }
},
  {
    // defaultScope: {
    //   attributes: { exclude: ['password'] },
    // },
    scopes: {
      // Si alguna vez necesitas incluir el password
      withPassword: {
        // attributes: {},
      },
    },
  }
);

// Sobrescribir el método toJSON en el prototipo del modelo
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

// Definir la relación con Role si es necesario
User.belongsTo(Role, { foreignKey: 'role_id' });
User.hasOne(Client, { keyType: 'id' });

export default User;
