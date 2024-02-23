import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorSettings = sequelize.define('VendorSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_key: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pause_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cancel_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    menu_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pickup_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    tableName: 'vendor_settings',
    timestamps: false,
  });  