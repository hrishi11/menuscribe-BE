import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const UserCustomer = sequelize.define(
  "UserCustomer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      // allowNull: true,
      // unique: true,
    },
    phone: {
      type: DataTypes.STRING,
    },
    address_1: {
      type: DataTypes.TEXT,
    },
    address_2: {
      type: DataTypes.TEXT,
    },
    postal_id: {
      type: DataTypes.INTEGER,
    },
    delivery_instruction: {
      type: DataTypes.TEXT,
    },
    postal_code: {
      type: DataTypes.STRING,
    },
    subscribe: {
      type: DataTypes.STRING,
    },
    created_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    status: {
      type: DataTypes.INTEGER,
    },
    city_id: {
      type: DataTypes.INTEGER,
    },
    verification_code: {
      type: DataTypes.INTEGER,
    },

    verification_pin: {
      type: DataTypes.INTEGER,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    last_order: {
      type: DataTypes.INTEGER,
    },
    subscribe: {
      type: DataTypes.TEXT,
    },
    tp_subscribe: {
      type: DataTypes.TEXT,
    },
    tp_privacy_policy: {
      type: DataTypes.TEXT,
    },
    tp_user: {
      type: DataTypes.INTEGER,
    },
    menuscribe_user: {
      type: DataTypes.INTEGER,
    },
  },
  {
    tableName: "user_customer",
    timestamps: false,
  }
);
