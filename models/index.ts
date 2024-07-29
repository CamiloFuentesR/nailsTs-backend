import Appointment from './appointment';
import Client from './client';
import Role from './role';
import Server from './server';
import Service from './service';
import User from './user';
import { UserInstance } from './user';
import { ClientInstance } from './client';
import ServicesCategory from './servicesCategory';
import BusinessHour from './businessHour';
import AppointmentService from './AppointmentService';
import ServicesCategorySecondary from './serviceCategorySecondary';
import ServicesSecondary from './serviceSecondary';

export {
  Appointment,
  Client,
  ClientInstance,
  Server,
  Role,
  Service,
  ServicesCategory,
  User,
  UserInstance,
  BusinessHour,
  AppointmentService,
  ServicesCategorySecondary,
  ServicesSecondary,
};

import './initAssociations';
