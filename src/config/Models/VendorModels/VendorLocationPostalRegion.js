import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorLocationPostalRegions = sequelize.define(
  "VendorLocationPostalRegions",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postal_region_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postal_region_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_location_postal_regions",
    timestamps: false,
  }
);
