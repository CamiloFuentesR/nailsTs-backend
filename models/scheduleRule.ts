import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';

export interface ScheduleRuleProps {
  id: string;
  dayOfWeek: number; // 0=domingo … 6=sábado, en hora de Chile
  startTime: string; // 'HH:mm', hora de pared del negocio
  endTime: string;
  validFrom: string; // 'YYYY-MM-DD'
  validUntil: string | null;
  blockDuration: string;
}

interface ScheduleRuleCreationAttributes
  extends Optional<ScheduleRuleProps, 'validUntil' | 'blockDuration'> {}

export interface ScheduleRuleInstance
  extends Model<ScheduleRuleProps, ScheduleRuleCreationAttributes>,
    ScheduleRuleProps {}

const ScheduleRule = db.define<ScheduleRuleInstance>('schedule_rule', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  dayOfWeek: {
    type: DataTypes.SMALLINT,
    allowNull: false,
  },
  // TIME sin zona: es hora de pared. La conversión a instante la hace el
  // frontend con la zona del negocio, en el momento de expandir cada fecha.
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  // DATEONLY devuelve 'YYYY-MM-DD' como string y no lo convierte a instante,
  // que es justo lo que se necesita para no arrastrar zona horaria.
  validFrom: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  blockDuration: {
    type: DataTypes.STRING(5),
    allowNull: false,
    defaultValue: '01:00',
  },
});

export default ScheduleRule;
