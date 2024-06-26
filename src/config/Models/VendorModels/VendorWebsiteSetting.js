import { sequelize } from "../../dbConfig.js";
import { DataTypes } from "sequelize";

export const VendorWebsiteSetting = sequelize.define(
  "VendorWebsiteSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendor_id: {
      type: DataTypes.INTEGER,

      allowNull: false,
    },

    section_type: {
      type: DataTypes.ENUM("info", "faq"),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    show_hide: {
      type: DataTypes.INTEGER,
      // allowNull: false,
    },
  },
  {
    tableName: "vendor_website_settings",
    timestamps: false,
  }
);
