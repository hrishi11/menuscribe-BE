import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorPackageMenuItems = sequelize.define(
  "VendorPackageMenuItems",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    menu_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menu_item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    menu_default_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menu_item_group_id: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    all_packages: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    menu_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    sort_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_default_linked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    replace_parent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    quantity_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "vendor_package_menu_items",
    timestamps: false,
  }
);
