require('dotenv').config();
const { USER, DB } = process.env;

const connectionString = `postgres://${ USER }@localhost:5432/${ DB }`;

const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = new Sequelize(connectionString);

/*
sequelize.authenticate()
  .then(() => {
    console.log('Connection authenticated!');
  })
  .catch((err) => {
    console.error(`Error connecting to DB: ${ err }`);
  });
*/

module.exports = { sequelize, QueryTypes };