import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const Categories = sequelize.define('Categories', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    category_name_singular: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category_plural: {
      type: DataTypes.STRING,
      allowNull: false
    },    
    
}, {
    tableName: 'categories',
    timestamps: false,
});