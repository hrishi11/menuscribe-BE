import { sequelize } from '../../dbConfig.js'
import { DataTypes } from 'sequelize';

export const CitiesAll = sequelize.define('CitiesAll', {
  id: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.ENUM(
      'AB','AK','AL','AR','AZ','BC','CA','CO','CT','DE','FL','GA','HI','IA','ID','IL',
      'IN','KS','KY','LA','MA','MB','MD','ME','MI','MN','MO','MS','MT','NB','NC','ND',
      'NE','NH','NJ','NL','NM','NS','NT','NU','NV','NY','OH','OK','ON','OR','PA','PE',
      'QC','RI','SC','SD','SK','TN','TX','UT','VA','VT','WA','WI','WV','WY','YT'
    ),
    allowNull: false,
  },
  country: {
    type: DataTypes.ENUM('US', 'CA'),
    allowNull: false,
  },
}, {
  tableName: 'cities_all',
  timestamps: false,
});