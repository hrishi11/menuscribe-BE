import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const PostalRegions = sequelize.define(
  "PostalRegions",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    POSTAL_CODE: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    CITY: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    PROVINCE_ABBR: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    TIME_ZONE: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    LATITUDE: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    LONGITUDE: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
  },
  {
    tableName: "postal_regions",
    timestamps: false,
  }
);
