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
  },
  {
    tableName: "vendor_settings",
    timestamps: false,
  }
);
