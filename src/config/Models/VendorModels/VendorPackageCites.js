import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorPackageCities = sequelize.define('VendorPackageCities', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'VendorPackage',
            key: 'id',
          },
    },
    city_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'CitiesActive',
            key: 'id',
          },
    },
}, {
    tableName: 'vendor_package_cities',
    timestamps: false,
});