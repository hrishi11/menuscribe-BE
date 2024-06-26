import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorDriverCities = sequelize.define(
  "VendorDriverCities",
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
    tableName: "vendor_driver_cities",
    timestamps: false,
  }
);
