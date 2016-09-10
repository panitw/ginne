'use strict';

const logger = require('winston');
const mongoose = require('mongoose');

logger.level = 'debug';

let task = require('../src/tasks/executeStrategy');

mongoose.Promise = global.Promise;

task.execute()
	.then((results) => {
		console.log('Recommendation: ');
		console.log(results);
	})
	.catch((ex) => {
		console.log('Error: ', ex);
	});