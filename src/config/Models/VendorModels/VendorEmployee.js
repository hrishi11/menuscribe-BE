import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorEmployee = sequelize.define(
  "VendorEmployee",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    user_vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    join_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    vendor_role_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_management_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customers_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    add_customer_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    menu_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    settings_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    homepage: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    packages_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    package_requests_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_orders_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    order_summary_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      
    },
    order_manager_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    team_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    all_subscriptions_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pickups_page: {
      type: DataTypes.INTEGER,
      // allowNull: true,
    },
    add_package_page: {
      type: DataTypes.INTEGER,
      // allowNull: true,
    },
    team_settings_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    promotions_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    locations_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_employee",
    timestamps: false,
  }
);
