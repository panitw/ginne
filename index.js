'use strict';

const logger = require('winston');
const BackTester = require('./src/execution/BackTester');
const DataProvider = require('./src/data/DataProvider');
const Plugin = require('./src/plugins/PluginManager');
const strategyPlugin = Plugin.getPlugin('strategy');

logger.level = 'debug';

let provider = new DataProvider();
provider
	.init()
	.then(() => {
		return strategyPlugin.getStrategy();
	})
	.then((strategy) => {
		let options = {
			initialAsset: 100000,
			targetPositions: 5,
			cutLossPercent: 0.1,
			start: new Date('2015-01-01'),
			end: new Date('2015-12-31'),
			tradeCommission: 0.001578,
			vat: 0.07,
			minDailyCommission: 50,
			slippagePercent: 0.01
		};

		let tester = new BackTester(provider);
		tester.run(strategy, options)
			.then((result) => {
				console.log(result);
			})
			.catch((err) => {
				logger.error(err);
			});
	})
	.catch((err) => {
		logger.error(err);
	});