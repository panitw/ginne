'use strict';
const logger = require('winston');
const config = require('./config');
const DataProvider = require('./data/DataProvider');

logger.level = 'debug';

let provider = new DataProvider(config);
provider
	.init()
	.then(() => {
		provider.getData('TVO.BK', new Date('2016-05-01')).then(
			(dataFrame) => {
				logger.debug('Received data ' + dataFrame.count() + ' points');
			}
		);
	})
	.catch((err) => {
		logger.error(err);
	});