import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorEmployeeLocations = sequelize.define(
  "VendorEmployeeLocations",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vendor_employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_employee_locations",
    timestamps: false,
  }
);
