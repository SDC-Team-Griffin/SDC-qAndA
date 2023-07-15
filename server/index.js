require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
const path = require('path');
const morgan = require('morgan');

const { sequelize, QueryTypes } = require('../db/db.js'); // import db (sequelize)

const { getQuestions, postQuestions, getAnswers } = require('./controller.js'); // controller actions

const app = express();

/*
app.use(express.static(
  path.join(__dirname, '../../frontendcapstone/dist'))
);
*/

app.use(morgan('dev'));
app.use(express.json());

// QUESTIONS
app.get('/qa/questions', getQuestions);
app.post('/qa/questions', postQuestions);

// ANSWERS
app.get('/qa/questions/:question_id/answers', getAnswers);

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});