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
      type: DataTypes.INTEGER, // Adjust the data type as per your requirement
      allowNull: true, // Adjust the allowNull property as per your requirement
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
    role: {
      type: DataTypes.ENUM("Admin", "Manager", "Rider"),
      allowNull: true,
    },
  },
  {
    tableName: "user_vendor",
    timestamps: false,
  }
);
