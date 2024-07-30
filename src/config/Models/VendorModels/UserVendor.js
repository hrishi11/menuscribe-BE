import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const UserVendor = sequelize.define(
  "UserVendor",
  {
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verification_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phone: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    website_admin: {
      type: DataTypes.INTEGER,
    },
    role: {
      type: DataTypes.ENUM("Admin", "Manager", "Rider"),
      allowNull: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    postal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "user_vendor",
    timestamps: false,
  }
);
