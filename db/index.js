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

let shuttingDown = false;

pool.on('connect', () => {
  console.log(`User "${ USER }" connected to DB: ${ DB }`);
});

pool.on('error', () => {
  console.error(`Unexpected error on idle client: ${ err }`);
  
  if (!shuttingDown) {
    shuttingDown = true;
    shutDown(1);
  }
});

const shutDown = async() => {
  if (shuttingDown) {
    return; // avoid re-entry
  }

  shuttingDown = true;

  console.log('Closing connection...');
  try {
    await pool.end();

  } catch(err) {
    console.error(`Error closing connection pool: ${ err }`);
    exitCode = 1; // set error exit code if issue closing pool

  }
  console.log('Connections closed.');
  process.exit(exitCode);
};

// fast shutdown —> terminates all connections
process.on('SIGINT', async() => {
  await shutDown(0); // successful shutdown
});

// smart shutdown —> no new connections but existing ones can continue normally
process.on('SIGTERM', async() => {
  await shutDown(0); // successful shutdown
});

(async() => {
  try {
    await pool.connect();

  } catch(err) {
    console.error(`Error connecting to DB: ${ err }`);
    process.exit(1); // indicates error during startup
  }
})();

module.exports = pool;
