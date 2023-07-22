require('dotenv').config();
const { PORT } = process.env;
const express = require('express');
const path = require('path');
const morgan = require('morgan');

require('newrelic'); // monitors performance in production

// ROUTES
const routerQ = require('./routes/questions');
const routerA = require('./routes/answers');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

/* (serve loader.io verification file —> stress testing)
app.use(
  express.static(path.join(__dirname, '../public'))
);
*/

// MOUNT ROUTERS
app.use('/qa/questions', routerQ);
app.use('/qa/questions', routerA);

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});

module.exports = app;
