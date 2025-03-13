import { AppointmentService, ServicesSecondary } from '.';
import Appointment from './appointment';
import AppointmentSate from './appointmentState';
import Client from './client';
import Role from './role';
import Service from './service';
import ServicesCategorySecondary from './serviceCategorySecondary';
import ServicesCategory from './servicesCategory';
import User from './user';

User.belongsTo(Role, { foreignKey: 'role_id' });
User.hasOne(Client, { foreignKey: 'user_id' });
Client.hasOne(User, { foreignKey: 'id' });
Client.belongsTo(User, { foreignKey: 'user_id' });
Service.belongsTo(ServicesCategory, { foreignKey: 'id' });
Service.belongsTo(ServicesCategory, {
  foreignKey: 'services_category_id',
  as: 'category',
});
ServicesSecondary.belongsTo(ServicesCategorySecondary, { foreignKey: 'id' });
Client.hasMany(Appointment, { foreignKey: 'client_id' });
Appointment.belongsTo(AppointmentSate, { foreignKey: 'state' });
AppointmentService.belongsTo(Service, { foreignKey: 'service_id' });
AppointmentService.belongsTo(Appointment, { foreignKey: 'appointment_id' });
Appointment.belongsTo(Client, { foreignKey: 'client_id' });
