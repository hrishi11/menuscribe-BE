import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorPackageFrequency = sequelize.define('VendorPackageFrequency', {
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
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    frequency_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    meals_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    days_total: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'vendor_package_frequency',
    timestamps: false,
});