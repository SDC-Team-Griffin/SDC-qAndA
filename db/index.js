require('dotenv').config();
const { USER, HOST, DB, PW, DB_PORT } = process.env;
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
    await pool.connect();
    console.log(`User "${ USER }" connected to DB: ${ DB }`);

  } catch(err) {
    console.error(`Error connecting to DB: ${ err }`);
    process.exit(1); // indicates error during startup
  }
})();

module.exports = pool;
