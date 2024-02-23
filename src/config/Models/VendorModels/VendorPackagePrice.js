import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorPackagePrice = sequelize.define('VendorPackagePrice', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    frequency: {
        type: DataTypes.ENUM('single', 'weekly', 'monthly'),
        allowNull: true,
    },
    method: {
        type: DataTypes.ENUM('pickup', 'delivery'),
        allowNull: true,
    },
    cost: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
}, {
    tableName: 'vendor_package_price',
    timestamps: false,
});