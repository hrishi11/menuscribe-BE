import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorPackageSlots = sequelize.define(
  "VendorPackageSlots",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    vendor_package_price_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    pickup_delivery: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_package_slots",
    timestamps: false,
  }
);
