'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const PluginManager = require('./src/plugins/PluginManager');
const notifier = PluginManager.getPlugin('notification');
const BackTestDaemon = require('./src/services/backtest/BackTestDaemon');
const DataProvider = require('./src/data/DataProvider');

const task_updateData = require('./src/tasks/updateData');
const task_executeStrategy = require('./src/tasks/executeStrategy');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const logger = require('winston');
logger.level = 'debug';

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const transactionRouter = require('./src/services/portfolio/transaction');
const positionsRouter = require('./src/services/portfolio/positions');
const recommendationsRouter = require('./src/services/portfolio/recommendation');
const strategyRouter = require('./src/services/strategy/strategy');

console.log('Ginne 1.0 starting up');

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);
app.use('/portfolio', recommendationsRouter);
app.use('/strategy', strategyRouter);

server.listen(80, function () {
	console.log('Web server is up and running');
});

console.log('Starting Back Test daemon');
let dataProvider = new DataProvider();
dataProvider.init()
	.then(() => {
		let backTestDaemon = new BackTestDaemon(dataProvider);
		io.on('connection', (socket) => {
			backTestDaemon.handle(socket);
		});
		logger.info('Service Ready...')
	});


console.log('Schedule data retrieval task');
schedule.scheduleJob({minute:0, hour: [6, 12]}, () => {
	console.log('Start pulling data from SET');
	//Pull data from SET and store to DB
	task_updateData.execute()
		.then(() => {
			notifier.notify('Successfully update data from SET');
		})
		.catch((ex) => {
			notifier.notify('Error updating data from SET, '+ex.message);
		});

});

console.log('Schedule strategy execution task');
schedule.scheduleJob({minute: 0, hour: 13}, () => {
	//Execute strategy
	task_executeStrategy.execute()
		.then(() => {
			notifier.notify('Finish executing strategy');
		})
		.catch((ex) => {
			notifier.notify('Error executing strategy, '+ex.message);
		});
});