require('dotenv').config();
const { HOST, USER, PW, DB } = process.env;
// console.log(`host: ${ HOST }, user: ${ USER }, pw: ${ PW }, db: ${ DB }`);

const fs = require('fs');
const { Client } = require('pg');

const connectionString = `postgres://${ USER }:${ PW }@localhost:5432/${ DB }`;
const client = new Client({ connectionString });

/*
const client = new Client({
  host: HOST,
  user: USER,
  pw: PW,
  port: 5432
});
*/

client.connect()
  .then(() => {
    console.log(`Connected to PostgreSQL DB: ${ DB }`);

    // read schema file
    const fileSchema = fs.readFileSync('./psqlSchema.sql', 'utf-8');

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