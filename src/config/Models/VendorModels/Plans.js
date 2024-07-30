import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const Plans = sequelize.define(
  "Plans",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    package_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    package_cost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "plans",
    timestamps: false,
  }
);
