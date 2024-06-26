import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const Vendor = sequelize.define(
  "Vendor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vendor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    address: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about_us: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    our_food: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    our_service_areas: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "vendor",
    timestamps: false,
  }
);
