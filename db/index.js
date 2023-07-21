require('dotenv').config();
const { USER, HOST1, HOST2, DB, PW, DB_PORT } = process.env;
const { Pool } = require('pg');

const pool = new Pool({
  user: USER,
  host: HOST1,
  database: DB,
  password: PW,
  port: DB_PORT
});

pool.on('connect', () => {
  console.log(`User "${ USER }" connected to DB: ${ DB }`);
});

const shutDown = async() => {
  console.log('Closing connection...');
  await pool.end();
  console.log('Connections closed.');
};

process.on('SIGINT', async() => {
  await shutDown();
  process.exit(0);
});

process.on('SIGTERM', async() => {
  await shutDown();
  process.exit(0);
});

/*
(async() => {
  try {
    await pool.connect();
    console.log(`Connected to DB: ${ DB }`);

  } catch(err) {
    console.error(`Error connecting to DB: ${ err }`);
  }
})();
*/

module.exports = pool;