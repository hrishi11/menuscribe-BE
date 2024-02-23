import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const UserVendor = sequelize.define('UserVendor', {
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
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
}, {
    tableName: 'user_vendor',
    timestamps: false,
});