const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const PluginManager = require('./src/plugins/PluginManager');
const notifier = PluginManager.getPlugin('notification');
const task_updateData = require('./src/tasks/updateData');

const logger = require('winston');
logger.level = 'debug';

let app = express();
let transactionRouter = require('./src/services/portfolio/transaction');
let positionsRouter = require('./src/services/portfolio/positions');

console.log('Ginne 1.0 starting up');

mongoose.Promise = global.Promise;

app.use(bodyParser.json());
app.use('/', express.static('src/frontend'));
app.use('/portfolio', transactionRouter);
app.use('/portfolio', positionsRouter);

app.listen(80, function () {
	console.log('Web server is up and running');
});

console.log('Schedule EOD task at every 19.00 GMT');
schedule.scheduleJob({minute: 55}, () => {

	//Pull data from SET and store to DB
	task_updateData.execute()
		.then(() => {
			notifier.notify('Successfully update data from SET');
		})
		.catch((ex) => {
			notifier.notify('Error updating data from SET, '+ex.message);
		});

	//Process EOD commissions

	//Execute strategy for tomorrow

	//Notify that the job has been executed

});