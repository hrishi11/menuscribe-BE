import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const CustomerPackageRequest = sequelize.define(
  "CustomerPackageRequest",
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
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pickup_delivery: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    frequency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timeslot_id: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
    customer_delivery_address_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_location_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_package_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_package_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    approve_at: {
      type: DataTypes.DATE,
      // allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      // allowNull: false,
    },
    request_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    tax: {
      type: DataTypes.STRING,
      // allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
    deleted: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
    sent_message: {
      type: DataTypes.STRING,
      // allowNull: true,
    },
  },
  {
    tableName: "customer_package_requests",
    timestamps: false,
  }
);
