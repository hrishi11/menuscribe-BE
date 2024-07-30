import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorCustomerPaymentLog = sequelize.define(
  "VendorCustomerPaymentLog",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customer_package_subscription_id: {
      type: DataTypes.TEXT,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tax: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    payment_date: {
      type: DataTypes.DATE,
    },
    payment_due: {
      type: DataTypes.DATE,
    },
    plan_id: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "vendor_customer_payment_log",
    timestamps: false,
  }
);
