'use strict';

const moment = require('moment');
const DataProvider = require('../data/DataProvider');
const TodayExecutor = require('../execution/TodayExecutor');
const PluginManager = require('../plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');
const universe = PluginManager.getPlugin('universe');

module.exports = {
	execute: () => {
		//Get configured strategy
		let tradeStrategy = strategy.getStrategy();

		//Phase-I:

		//Scan how long to read the historical data
		let screenerCmds = tradeStrategy.screener.commands();
		let maxPeriod = 20;
		for (let i=0; i<screenerCmds.length; i++) {
			if (screenerCmds[i].cmd === 'ANALYSIS') {
				let options = screenerCmds[i].options;
				if (options.input) {
					for (let inputName in options.input) {
						if (inputName.toUpperCase().indexOf('PERIOD') > -1) {
							maxPeriod = Math.max(maxPeriod, options.input[inputName]);
						}
					}
				}
			}
		}
		//Times 2 to get enough data
		maxPeriod *= 2;

		let derivedUniverse = universe.getUniverse('SET');
		let today = moment().utc().startOf('day').toDate();

		let dataProvider = new DataProvider();
		let executor = null;
		return dataProvider.init()
			.then(() => {
				executor = new TodayExecutor(today, dataProvider);
				return executor.run(tradeStrategy, derivedUniverse, maxPeriod);
			});
	}
};