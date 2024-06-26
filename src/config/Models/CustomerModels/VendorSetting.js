import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorSetting = sequelize.define('VendorSetting', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  time_zone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  province_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

}, {
  tableName: 'vendor_setting',
  timestamps: false,
});