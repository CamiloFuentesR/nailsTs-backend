import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import Service from './service';
import { UUIDVersion } from 'express-validator/lib/options';
import Appointment from './appointment';

export interface AppointmentServiceProps {
  id: UUIDVersion;
  appointment_id: UUIDVersion;
  service_id: number;
  state: number;
  appointment_service_price: number;
  /**
   * Cuántas veces se hizo este servicio en la cita. Siempre 1 o más; solo pasa
   * de 1 en los servicios marcados como `por_unidad`.
   */
  cantidad: number;
  totalEarnings?: number | undefined;
}

// `cantidad` es opcional al crear porque la columna trae DEFAULT 1: quien no la
// mande sigue guardando una fila igual a las de siempre.
interface AppointmentServiceCreationAttributes
  extends Optional<AppointmentServiceProps, 'id' | 'cantidad'> {}

export interface AppointmentServiceInstance
  extends Model<AppointmentServiceProps, AppointmentServiceCreationAttributes>,
    AppointmentServiceProps {
  Service: any;
  Appointment: any;
}

const AppointmentService = db.define<AppointmentServiceInstance>(
  'appointment_services',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Appointment,
        key: 'id',
      },
    },
    state: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    appointment_service_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    /*
     * Cuántas veces se hizo el servicio en esta cita. Va acá y no en Services
     * porque el servicio define que se cobra por unidad y la cita registra
     * cuántas se hicieron.
     *
     * Una fila con cantidad en vez de N filas repetidas: los informes cuentan
     * filas (getAppointmentServiceReportByGroup suma +1 por fila), así que tres
     * parches repetidos se leerían como tres servicios en la categoría.
     *
     * NOT NULL DEFAULT 1: las citas que ya existen valen 1, que es exactamente
     * lo que significan hoy.
     *
     * La columna la agrega helpers/ensureServiceColumns al arrancar.
     */
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Service,
        key: 'id',
      },
    },
  },
);

export default AppointmentService;
