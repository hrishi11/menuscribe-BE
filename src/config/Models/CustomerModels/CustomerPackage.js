import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const CustomerPackage = sequelize.define('CustomerPackage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_package_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    customer_delivery_address_id:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pickup_delivery	: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'customer_package',
    timestamps: false,
  });