import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const PaymentMethods = sequelize.define(
  "PaymentMethods",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    method_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },    
  },
  {
    tableName: "payment_methods",
    timestamps: false,
  }
);
