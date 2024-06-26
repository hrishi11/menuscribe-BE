import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const CouponTypes = sequelize.define(
  "CouponTypes",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coupon_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coupon_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "coupon_types",
    timestamps: false,
  }
);
