//rehan-start
import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const SubscriptionOrders = sequelize.define(
  "SubscriptionOrders",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    creation_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    subscription_period: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    package_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meals_added: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "customer_subscription_orders",
    timestamps: false,
  }
);
//rehan-end
