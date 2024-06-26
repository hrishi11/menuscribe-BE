import { Sequelize } from 'sequelize';

//live
// export const sequelize = new Sequelize({
//   dialect: 'mysql',
//   host: 'localhost',
//   username: 'menu_app',
//   password: 'PDilxfWhEAzG',
//   database: 'menu_menuscribe',
//   logging: false
// });

//local
export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',
  username: 'root',
  password: '',
  database: 'menuscribe',
  logging: false
});
// Enable logging
sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((err) => {
  console.error('Unable to connect to the database:', err);
});