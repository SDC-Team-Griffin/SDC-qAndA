require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
// const path = require('path');
const morgan = require('morgan');

// const { sequelize } = require('../db/db.js'); // import db (sequelize)

const { questions, answers } = require('./controller'); // controller actions

const app = express();

/*
app.use(express.static(
  path.join(__dirname, '../../frontendcapstone/dist'))
);
*/

app.use(morgan('dev'));
app.use(express.json());

// QUESTIONS
app.get('/qa/questions', questions.GET);
app.post('/qa/questions', questions.POST);

// ANSWERS
app.get('/qa/questions/:question_id/answers', answers.GET);
app.post('/qa/questions/:question_id/answers', answers.POST);

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});