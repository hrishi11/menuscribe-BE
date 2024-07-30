import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorSettings = sequelize.define(
  "VendorSettings",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    no_of_employees: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_locations: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_customers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_packages: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_menu_items: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    no_of_drivers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    vendor_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripe_key: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pause_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    menu_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    delivery_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pickup_option: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    about_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    food_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    food_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_area_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    service_area_description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    public_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    public_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    public_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tax_default: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cash_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    creditcard_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    interac_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dashboard_page: {
      type: DataTypes.INTEGER,
    },
    get_started_page: {
      type: DataTypes.INTEGER,
    },
    customers_page: {
      type: DataTypes.INTEGER,
    },
    packages_page: {
      type: DataTypes.INTEGER,
    },
    package_requests_page: {
      type: DataTypes.INTEGER,
    },
    promotions_page: {
      type: DataTypes.INTEGER,
    },
    upload_users_page: {
      type: DataTypes.INTEGER,
    },
    pickups_page: {
      type: DataTypes.INTEGER,
    },
    create_menu_page: {
      type: DataTypes.INTEGER,
    },
    multiple_menu_editor_page: {
      type: DataTypes.INTEGER,
    },
    customer_orders_page: {
      type: DataTypes.INTEGER,
    },
    website_setting_page: {
      type: DataTypes.INTEGER,
    },
    order_summary_page: {
      type: DataTypes.INTEGER,
    },
    order_manager_page: {
      type: DataTypes.INTEGER,
    },
    delivery_manager_page: {
      type: DataTypes.INTEGER,
    },
    delivery_page: {
      type: DataTypes.INTEGER,
    },
    my_team_page: {
      type: DataTypes.INTEGER,
    },
    all_subscriptions_page: {
      type: DataTypes.INTEGER,
    },
    team_settings_page: {
      type: DataTypes.INTEGER,
    },
    locations_page: {
      type: DataTypes.INTEGER,
    },
    settings_page: {
      type: DataTypes.INTEGER,
    },
    payments_page: {
      type: DataTypes.INTEGER,
    },
    billing_page: {
      type: DataTypes.INTEGER,
    },
    payment_settings_page: {
      type: DataTypes.INTEGER,
    },
    ad_desginer_page: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "vendor_settings",
    timestamps: false,
  }
);
