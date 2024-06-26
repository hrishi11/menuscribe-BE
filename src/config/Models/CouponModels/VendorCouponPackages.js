import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorCouponPackages = sequelize.define(
  "VendorCouponPackages",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_coupon_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_package_price_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "vendor_coupon_packages",
    timestamps: false,
  }
);
