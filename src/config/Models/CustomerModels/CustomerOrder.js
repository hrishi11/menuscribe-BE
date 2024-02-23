import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const CustomerOrder = sequelize.define('CustomerOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_ready: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_delivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    delivery_img: {
      type: DataTypes.STRING,
    },
    delivered_time: {
      type: DataTypes.DATE,
    },
    customer_delivery_address_id:{
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'customer_orders',
    timestamps: false,
  });