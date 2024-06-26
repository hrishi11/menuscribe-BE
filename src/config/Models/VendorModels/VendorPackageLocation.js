import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorPackageLocations = sequelize.define('VendorPackageLocations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    vendor_location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    vendor_package_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
   
}, {
    tableName: 'vendor_package_locations',
    timestamps: false,
});