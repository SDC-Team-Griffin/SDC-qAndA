require('dotenv').config();
const { PORT } = process.env;
const path = require('path');
const express = require('express');

const app = express();

app.use(express.static(path.join(__dirname, '../../frontendcapstone/dist')));

app.listen(PORT, () => {
  console.log(`Server listening to PORT: ${ PORT }`);
});