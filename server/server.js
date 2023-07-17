require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
const morgan = require('morgan');

// ROUTES
const routerQ = require('./routes/questions');
const routerA = require('./routes/answers');

const app = express();

/*
// const path = require('path');

app.use(express.static(
  path.join(__dirname, '../../frontendcapstone/dist'))
);
*/

app.use(morgan('dev'));
app.use(express.json());

// MOUNT ROUTERS
app.use('/qa/questions', routerQ);
app.use('/qa/questions', routerA);

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});