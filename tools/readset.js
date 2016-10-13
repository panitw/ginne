'use strict';

const logger = require('winston');
const mongoose = require('mongoose');

logger.level = 'debug';

let task = require('../src/tasks/updateData');

mongoose.Promise = global.Promise;

task.execute()
	.then((results) => {
		console.log('Finish update data from SET');
	})
	.catch((ex) => {
		console.log('Error: ', ex, ex.stack);
	});