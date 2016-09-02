const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

let app = express();
let transactionRouter = require('./src/services/portfolio/transaction');
let positionsRouter = require('./src/services/portfolio/positions');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);

app.listen(80, function () {
    console.log('Ginne 1.0 is running');
});