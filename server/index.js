require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const { db, QueryTypes } = require('../db/db.js'); // import db (sequelize)

const app = express();

app.use(express.static(
  path.join(__dirname, '../../frontendcapstone/dist'))
);

app.use(morgan('dev'));
app.use(express.json());

app.get('/qa/questions', (req, res) => {
  const { product_id, page, count } = req.query;

  const offset = (page - 1) * count;

  const strQuery = `
    SELECT * FROM questions
    WHERE product_id = ${ product_id }
    ORDER BY id
    LIMIT ${ count }
    OFFSET ${ offset }
  `;

  db.query(strQuery, { type: QueryTypes.SELECT })
    .then((questions) => {
      console.log('Questions fetched successfully!');

      res.send(questions);
    })
    .catch((err) => {
      res.status(500).send(`Error fetching questions: ${ err }`)
    });
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const { question_id } = req.params;
  const { page, count } = req.query;

  const offset = (page - 1) * count;

  const strQuery = `
    SELECT * FROM answers
    WHERE question_id = ${ question_id }
    ORDER BY id
    LIMIT ${ count }
    OFFSET ${ offset }
  `;

  db.query(strQuery, { type: QueryTypes.SELECT })
    .then((answers) => {
      console.log('Answers fetched successfully!');

      res.send(answers);
    })
    .catch((err) => {
      res.status(500).send(`Error fetching answers: ${ err }`);
    });
});

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});