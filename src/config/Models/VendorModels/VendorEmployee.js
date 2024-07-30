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
      defaultValue: Date.now(),
    },
    vendor_role_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    delivery_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    delivery_manager_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    delivery_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    customers_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    add_customer_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    create_menu_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    settings_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    dashboard_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    packages_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    package_requests_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    customer_orders_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    order_summary_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    order_manager_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    my_team_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    all_subscriptions_page: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    pickups_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    add_package_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    team_settings_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    promotions_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locations_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    get_started_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    upload_users_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    multiple_menu_editor_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    website_setting_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payments_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    billing_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    payment_settings_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ad_desginer_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "vendor_employee",
    timestamps: false,
  }
);
