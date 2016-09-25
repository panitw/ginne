'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const PluginManager = require('./src/plugins/PluginManager');
const notifier = PluginManager.getPlugin('notification');
const BackTestDaemon = require('./src/services/backtest/BackTestDaemon');

const task_updateData = require('./src/tasks/updateData');
const task_executeStrategy = require('./src/tasks/executeStrategy');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const logger = require('winston');
logger.level = 'debug';

let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let transactionRouter = require('./src/services/portfolio/transaction');
let positionsRouter = require('./src/services/portfolio/positions');
let recommendationsRouter = require('./src/services/portfolio/recommendation');

console.log('Ginne 1.0 starting up');

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);
app.use('/portfolio', recommendationsRouter);

server.listen(80, function () {
	console.log('Web server is up and running');
});

console.log('Starting Back Test daemon');
let backTestDaemon = new BackTestDaemon();
io.on('connection', backTestDaemon.handle);

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