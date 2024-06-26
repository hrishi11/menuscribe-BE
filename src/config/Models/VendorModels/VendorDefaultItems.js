import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorDefaultItem = sequelize.define(
  "VendorDefaultItem",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendor_category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_default_items",
    timestamps: false,
  }
);
