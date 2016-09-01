var express = require('express');
var app = express();

var transactionRouter = require('./src/services/portfolio/transaction');
var positionsRouter = require('./src/services/portfolio/positions');

app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);

app.listen(80, function () {
    console.log('Ginne 1.0 is running');
});