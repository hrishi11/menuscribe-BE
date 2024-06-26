import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorLocationHolidays = sequelize.define('VendorLocationHolidays', {
  id: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  vendor_location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

}, {
  tableName: 'vendor_location_holidays',
  timestamps: false,
});