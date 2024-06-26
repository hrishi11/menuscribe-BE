import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorCities = sequelize.define(
  "VendorCities",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    vendor_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },

  {
    tableName: "vendor_cities",
    timestamps: false,
  }
);
