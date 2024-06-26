import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorTax = sequelize.define(
  "VendorTax",
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
    tax_percent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    default_tax: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_tax",
    timestamps: false,
  }
);
