import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const CitiesActive = sequelize.define('CitiesActive', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shortcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    colour: {
      type: DataTypes.STRING,
      allowNull: false,
    },
}, {
    tableName: 'cities_active',
    timestamps: false,
});