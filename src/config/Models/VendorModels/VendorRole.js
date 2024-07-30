import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorRoles = sequelize.define(
  "VendorRoles",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "vendor_roles",
    timestamps: false,
  }
);
