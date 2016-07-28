'use strict';
const logger = require('winston');
const BackTester = require('./backtesting/BackTester');
const DataProvider = require('./data/DataProvider');

logger.level = 'debug';

let provider = new DataProvider();
provider
	.init()
	.then(() => {
		let strategy = require('./strategies/linearRegressionSlope/strategy');
		let options = {
			initialAsset: 30000,
			targetPositions: 2,
			start: '2015-01-01',
			end: '2016-07-27',
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

			});
	})
	.catch((err) => {
		logger.error(err);
	});