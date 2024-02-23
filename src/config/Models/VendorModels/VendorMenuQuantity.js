import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorMenuQuantity = sequelize.define('VendorMenuQuantity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    measure: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'vendor_menu_quantity',
    timestamps: false,
});