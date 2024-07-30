import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";
import { CustomerPackage } from "./CustomerPackage.js";

export const CustomerOrder = sequelize.define(
  "CustomerOrder",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.INTEGER,
    },

    pickup_delivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_package_subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_ready: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_delivered: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    tax: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    total: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    delivery_img: {
      type: DataTypes.STRING,
    },
    vendor_employee_id: {
      type: DataTypes.INTEGER,
    },
    delivered_time: {
      type: DataTypes.DATE,
    },
    customer_delivery_address_id: {
      type: DataTypes.INTEGER,
    },
    vendor_location_id: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
    },
    delivery_address: {
      type: DataTypes.CHAR,
    },
    vendor_package_slots_id: {
      type: DataTypes.INTEGER,
    },
    driver_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "customer_orders",
    timestamps: false,
  }
);
