import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorLocations = sequelize.define('VendorLocations', {
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
    location_name: {
      type: DataTypes.STRING,
      allowNull: false,      
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },    
}, {
    tableName: 'vendor_locations',
    timestamps: false,
});