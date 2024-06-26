import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const ProvinceAll = sequelize.define('ProvinceAll', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
 
  province_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

}, {
  tableName: 'province_all',
  timestamps: false,
});