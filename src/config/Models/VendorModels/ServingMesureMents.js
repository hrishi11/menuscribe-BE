import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const ServingMesurements = sequelize.define(
  "ServingMesurements",
  {
    id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    singular: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plural: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "serving_measurements",
    timestamps: false,
  }
);
