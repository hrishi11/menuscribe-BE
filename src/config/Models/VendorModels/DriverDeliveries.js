import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";
import { VendorDrivers } from "./VendorDrivers.js";

export const DriverDeliveries = sequelize.define(
  "DriverDeliveries",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    charges: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    address: {
      type: DataTypes.FLOAT,
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
    tableName: "driver_deliveries",
    timestamps: false,
  }
);

// DriverDeliveries.hasMany(VendorDrivers, {
//   foreignKey: "id",
//   as: "VendorDrivers",
// });
