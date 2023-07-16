require('dotenv').config();
const { USER, HOST, DB, PW, DB_PORT } = process.env;
const { Pool } = require('pg');

// const connectionString = `postgres://${ USER }:${ PW }@${ HOST }:${ DB_PORT }/${ DB }`;
const pool = new Pool({
  user: USER,
  host: HOST,
  database: DB,
  password: PW,
  port: DB_PORT
});

(async() => {
  try {
    await pool.connect();
    console.log(`Connected to DB: ${ DB }`);
  } catch(err) {
    console.error(`Error connecting to DB: ${ err }`);
  }
})();

module.exports = pool;

/*
const { Sequelize, QueryTypes } = require('sequelize');
const sequelize = new Sequelize(connectionString);

sequelize.authenticate()
  .then(() => {
    console.log('Connection authenticated!');
  })
  .catch((err) => {
    console.error(`Error connecting to DB: ${ err }`);
  });

module.exports = { sequelize, QueryTypes };
*/