'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('winston');

const BackTestDaemon = require('../src/services/backtest/BackTestDaemon');
const DataProvider = require('../src/data/DataProvider');

const strategyRouter = require('../src/services/strategy/strategy');

mongoose.Promise = global.Promise;
logger.level = 'debug';

let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let dataProvider = new DataProvider();

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/strategy', strategyRouter);

server.listen(8080, function () {
	logger.info('Web server is up and running');
});

logger.info('Starting Back Test daemon');
dataProvider.init()
	.then(() => {
		let backTestDaemon = new BackTestDaemon(dataProvider);
		io.on('connection', (socket) => {
			backTestDaemon.handle(socket);
		});
		logger.info('Service Ready...')
	});