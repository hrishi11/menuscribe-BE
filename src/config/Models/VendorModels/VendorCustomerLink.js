import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorCustomerLink = sequelize.define('VendorCustomerLink', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_instructions: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'vendor_customer_link',
    timestamps: false, 
  });
  