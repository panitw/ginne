'use strict';

const logger = require('winston');
const BackTester = require('./src/backtesting/BackTester');
const DataProvider = require('./src/data/DataProvider');

logger.level = 'debug';

let provider = new DataProvider();
provider
	.init()
	.then(() => {
		let strategy = require('./src/strategies/highestHigh/strategy');
		let options = {
			initialAsset: 100000,
			targetPositions: 5,
			start: new Date('2014-01-01'),
			end: new Date('2015-12-31'),
			tradeCommission: 0.001578,
			minDailyCommission: 50,
			vat: 0.07,
			slippagePercent: 0.01
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