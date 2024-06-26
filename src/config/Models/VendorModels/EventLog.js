import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const EventLog = sequelize.define(
  "EventLog",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["CREATE PACKAGE", "EDIT PACKAGE", "CANCEL PACKAGE"],
    },
    details: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sms: {
      type: DataTypes.INTEGER,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "event_log",
    timestamps: false,
  }
);
