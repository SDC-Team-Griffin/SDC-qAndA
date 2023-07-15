require('dotenv').config();
const { USER, DB } = process.env;
// console.log(`user: ${ USER }, db: ${ DB }`);

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = `postgres://${ USER }@localhost:5432/${ DB }`;
const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log(`Connected to PostgreSQL DB: ${ DB }`);

    const filePath = path.join(__dirname, 'psqlSchema.sql');
    // console.log(`filePath: ${ filePath }`);

    // read schema file
    const fileSchema = fs.readFileSync(filePath, 'utf-8');

    const sqlStatements = fileSchema
      // split file into statements
      .split(';')
      // remove empty statements & comments
      .filter((statement) => {
        return statement.trim() !== '' && !statement.startsWith('--');
      });

    // exec each SQL statement
    return Promise.all(
      sqlStatements.map((statement) => client.query(statement))
    );
  })
  .then(() => {
    console.log('SQL file exec successfully!');
    client.end();
  })
  .catch((err) => {
    console.error(`Error exec SQL file: ${ err }`);
    client.end();
  });