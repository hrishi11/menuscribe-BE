import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const VendorMenuItems = sequelize.define('VendorMenuItems', {
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
    item_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    units: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    item_category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    veg: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    created_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    table_description: {
        type: DataTypes.TEXT,
        allowNull: true, // adjust as needed
    },
}, {
    tableName: 'vendor_menu_items',
    timestamps: false,
});