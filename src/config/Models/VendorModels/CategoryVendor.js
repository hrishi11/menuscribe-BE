import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const CategoryVendor = sequelize.define(
  "CategoryVendor",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_categories",
    timestamps: false,
  }
);
