require('dotenv').config();
const { USER, HOST, DB, PW, DB_PORT, NODE_ENV } = process.env;
const { Pool } = require('pg');

const pool = new Pool({
  user: USER,
  host: HOST,
  database: DB,
  password: PW,
  port: DB_PORT
});

(async() => {
  try {
    if (NODE_ENV !== 'test') {
      await pool.connect();
      console.log(`Connected to DB: ${ DB }`);
    }
  } catch(err) {
    console.error(`Error connecting to DB: ${ err }`);
  }
})();

module.exports = pool;