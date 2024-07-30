import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorDriverPostalRegions = sequelize.define(
  "VendorDriverPostalRegions",
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

    city_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_driver_postal_regions",
    timestamps: false,
  }
);
