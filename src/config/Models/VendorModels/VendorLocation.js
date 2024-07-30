import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorLocations = sequelize.define(
  "VendorLocations",
  {
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
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    location_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery_instructions: {
      type: DataTypes.STRING,
    },
    pickup_instructions: {
      type: DataTypes.STRING,
    },
    unit_number: {
      type: DataTypes.STRING,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tax_percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postal_id: {
      type: DataTypes.INTEGER,
    },
    postal: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "vendor_locations",
    timestamps: false,
  }
);
