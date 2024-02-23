import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const CustomerDeliveryAddress = sequelize.define('CustomerDeliveryAddress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  city_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  postal: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  delivery_instructions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'customer_delivery_address',
  timestamps: false,
});