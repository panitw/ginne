'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const PluginManager = require('./src/plugins/PluginManager');
const notifier = PluginManager.getPlugin('notification');
const task_updateData = require('./src/tasks/updateData');
const task_executeStrategy = require('./src/tasks/executeStrategy');

const logger = require('winston');
logger.level = 'debug';

let app = express();
let transactionRouter = require('./src/services/portfolio/transaction');
let positionsRouter = require('./src/services/portfolio/positions');
let recommendationsRouter = require('./src/services/portfolio/recommendation');

console.log('Ginne 1.0 starting up');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);
app.use('/portfolio', recommendationsRouter);

app.listen(80, function () {
	console.log('Web server is up and running');
});

console.log('Schedule data retrieval task');
schedule.scheduleJob({minute:0, hour: [6, 12]}, () => {

	//Pull data from SET and store to DB
	task_updateData.execute()
		.then(() => {
			notifier.notify('Successfully update data from SET');
		})
		.catch((ex) => {
			notifier.notify('Error updating data from SET, '+ex.message);
		});

});

schedule.scheduleJob({minute: 0, hour: 19}, () => {

	//Execute strategy
	task_executeStrategy.execute()
		.then(() => {
			notifier.notify('Finish executing strategy');
		})
		.catch((ex) => {
			notifier.notify('Error executing strategy, '+ex.message);
		});
});