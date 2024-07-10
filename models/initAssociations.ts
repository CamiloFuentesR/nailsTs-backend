import Appointment from './appointment';
import AppointmentSate from './appointmentState';
import Client from './client';
import Role from './role';
import Service from './service';
import ServicesCategory from './servicesCategory';
import User from './user';

User.belongsTo(Role, { foreignKey: 'role_id' });
User.hasOne(Client, { foreignKey: 'user_id' });
Client.hasOne(User, { foreignKey: 'id' });
Client.belongsTo(User, { foreignKey: 'user_id' });
Service.belongsTo(ServicesCategory, { foreignKey: 'id' });
Client.hasMany(Appointment, { foreignKey: 'client_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id' });
Appointment.belongsTo(ServicesCategory, { foreignKey: 'category_id' });
Appointment.belongsTo(AppointmentSate, { foreignKey: 'state' });
