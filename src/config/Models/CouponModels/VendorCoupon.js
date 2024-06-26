import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorCoupon = sequelize.define(
  "VendorCoupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    coupon_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coupon_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: false,
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
    repeat_redemption: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
  },
  {
    tableName: "vendor_coupon",
    timestamps: false,
  }
);
