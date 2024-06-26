import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorLocationServiceAreas = sequelize.define(
  "VendorLocationServiceAreas",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // vendor_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
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
    tableName: "vendor_location_service_areas",
    timestamps: false,
  }
);
