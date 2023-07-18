require('dotenv').config();
const { PORT, NODE_ENV } = process.env;
const express = require('express');
const morgan = require('morgan');
const path = require('path');

// ROUTES
const routerQ = require('./routes/questions');
const routerA = require('./routes/answers');

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// serve loader.io verification file —> stress testing
if (NODE_ENV === 'test') {
  app.use(
    express.static(path.join(__dirname, '../public'))
  );
}

/*
app.use(express.static(
  path.join(__dirname, '../../frontendcapstone/dist'))
);
*/

// MOUNT ROUTERS
app.use('/qa/questions', routerQ);
app.use('/qa/questions', routerA);

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});