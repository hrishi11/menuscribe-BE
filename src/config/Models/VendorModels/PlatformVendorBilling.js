import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const PlatformVendorBilling = sequelize.define(
  "PlatformVendorBilling",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    vendor_id: {
      type: DataTypes.INTEGER,
      //   allowNull: true,
    },
    plan_id: {
      type: DataTypes.INTEGER,
      //   allowNull: true,
    },

    payment_date: {
      type: DataTypes.DATE,
      //   allowNull: true,
    },

    payment_due: {
      type: DataTypes.DATE,
      //   allowNull: true,
    },
    stripe_billing: {
      type: DataTypes.INTEGER,
      //   allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      //   allowNull: true,
    },
  },
  {
    tableName: "platform_vendor_billing",
    timestamps: false,
  }
);
