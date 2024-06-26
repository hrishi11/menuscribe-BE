import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";
import { DriverDeliveries } from "./DriverDeliveries.js";

export const VendorDrivers = sequelize.define(
  "VendorDrivers",
  {
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
    driver_id: {
      type: DataTypes.INTEGER,
    allowNull: false,
    },
    delivery_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "vendor_drivers",
    timestamps: false,
  }
);

// VendorDrivers.belongsTo(DriverDeliveries, {
//   foreignKey: "id",
//   as: "DriverDeliveries",
// });
