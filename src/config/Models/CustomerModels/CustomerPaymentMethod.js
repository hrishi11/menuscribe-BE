import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const CustomerPaymentMethod = sequelize.define(
  "CustomerPaymentMethod",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
    card_number: {
      type: DataTypes.STRING,
    },
    expiry_month: {
      type: DataTypes.INTEGER,
    },
    expiry_year: {
      type: DataTypes.INTEGER,
    },
    instructions: {
      type: DataTypes.STRING,
    },
    card_type: {
      type: DataTypes.STRING,
    },

    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "customer_payment_method",
    timestamps: false,
  }
);
