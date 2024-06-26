import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorPackageDefaultItem = sequelize.define(
  "VendorPackageDefaultItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    all_packages: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    default_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    item_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendor_category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    xx_measurement: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_package_default_items",
    timestamps: false,
  }
);
