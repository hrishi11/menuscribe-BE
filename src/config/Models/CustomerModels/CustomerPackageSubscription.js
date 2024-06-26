import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const CustomerPackageSubscription = sequelize.define(
  "CustomerPackageSubscription",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_package_frequency_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now(),
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
    },

    payment_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      // allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "customer_package_subscriptions",
    timestamps: false,
  }
);
