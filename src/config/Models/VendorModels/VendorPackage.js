import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorPackage = sequelize.define('VendorPackage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  package_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  package_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price_daily: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  price_weekly: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  price_monthly: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tax_percent: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  pause: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivery: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  delivery_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  delivery_schedule_start: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  delivery_schedule_end: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  pickup: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pickup_price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  pickup_schedule_start: {
    type: DataTypes.TIME,
    allowNull: true, // Adjust as needed
  },
  pickup_schedule_end: {
    type: DataTypes.TIME,
    allowNull: true, // Adjust as needed
  },
  mon: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  wed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  thu: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fri: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sat: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sun: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'vendor_package',
  timestamps: false,
});