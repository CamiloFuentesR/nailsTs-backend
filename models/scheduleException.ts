import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';

export interface ScheduleExceptionProps {
  id: string;
  date: string; // 'YYYY-MM-DD' del calendario chileno
  startTime: string | null; // null = cierra el día completo
  endTime: string | null;
  reason: string | null;
}

interface ScheduleExceptionCreationAttributes
  extends Optional<ScheduleExceptionProps, 'startTime' | 'endTime' | 'reason'> {}

export interface ScheduleExceptionInstance
  extends Model<ScheduleExceptionProps, ScheduleExceptionCreationAttributes>,
    ScheduleExceptionProps {}

const ScheduleException = db.define<ScheduleExceptionInstance>(
  'schedule_exception',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
  },
);

export default ScheduleException;
