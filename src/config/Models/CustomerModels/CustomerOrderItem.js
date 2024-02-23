import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';


export const CustomerOrderItem = sequelize.define('CustomerOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  item_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'customer_order_items',
  timestamps: false,
});