import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorPaymentMethods = sequelize.define(
  "VendorPaymentMethods",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendor_location_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_method_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    instructions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    vendor_accepted: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    admin_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_payment_methods",
    timestamps: false,
  }
);
