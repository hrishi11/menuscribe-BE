import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorTamplateDesigner = sequelize.define(
  "VendorTamplateDesigner",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    first: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    second: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    third: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    forth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fifth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sixth: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_tamplate_designer",
    timestamps: false,
  }
);
