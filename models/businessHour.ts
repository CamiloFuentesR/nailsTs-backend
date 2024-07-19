import { DataTypes, Model, Optional } from 'sequelize';
import db from '../db/conection';
import { UUIDVersion } from 'express-validator/lib/options';

export interface BusinessHourProps {
  id: UUIDVersion;
  start: Date;
  end: Date;
  daysOfWeek: string[];
  endTime: Date;
  startTime: Date;
  backgroundColor: string;
  blockDuration: string;
  display: string;
}

interface BusinessHourCreationAttributes
  extends Optional<BusinessHourProps, 'id'> {}

export interface BusinessHourInstance
  extends Model<BusinessHourProps, BusinessHourCreationAttributes>,
    BusinessHourProps {}

const BusinessHour = db.define<BusinessHourInstance>(
  'business_hour',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      autoIncrement: true,
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    daysOfWeek: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    backgroundColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    display: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blockDuration: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: false,
  },
);

export default BusinessHour;
