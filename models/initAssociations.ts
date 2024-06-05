import Appointment from './appointment';
import Client from './client';
import Role from './role';
import Service from './service';
import ServicesCategory from './servicesCategory';
import User from './user';

User.belongsTo(Role, { foreignKey: 'role_id' });
User.hasOne(Client, { foreignKey: 'user_id' });
Client.hasOne(User, { foreignKey: 'id' });
Client.belongsTo(User, { foreignKey: 'user_id' });
Client.hasMany(Appointment, { foreignKey: 'cliente_id' });
Service.belongsTo(ServicesCategory, { foreignKey: 'services_category_id' });
