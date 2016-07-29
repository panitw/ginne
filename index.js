'use strict';

const logger = require('winston');
const BackTester = require('./backtesting/BackTester');
const DataProvider = require('./data/DataProvider');

logger.level = 'debug';

let provider = new DataProvider();
provider
	.init()
	.then(() => {
		let strategy = require('./strategies/test/strategy');
		let options = {
			initialAsset: 30000,
			targetPositions: 2,
			start: new Date('2016-05-01'),
			end: new Date('2016-06-30'),
			tradeCommission: {
				minimum: 50,
				percent: 0.1578
			},
			slippagePercent: 0.2
		};

		let tester = new BackTester(provider);
		tester
			.run(strategy, options)
			.then((result) => {
				
			})
			.catch((err) => {
				logger.error(err);
			});
	})
	.catch((err) => {
		logger.error(err);
	});