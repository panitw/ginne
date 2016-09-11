'use strict';

const moment = require('moment');
const DataProvider = require('../data/DataProvider');
const TodayExecutor = require('../execution/TodayExecutor');
const Recommendation = require('../execution/Recommendation');
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
			})
			.then((results) => {
				if (results) {
					let recommendationObj = new Recommendation({
						date: today,
						recommendations: []
					});
					results.forEach((item) => {
						if (item.type === 'B' || item.type === 'S') {
							let recommendation = {
								type: ((item.type === 'B')? 'buy' : 'sell'),
								symbol: item.symbol,
								price: item.price,
								amount: item.number
							};
							console.log(recommendation);
							recommendationObj.recommendations.push(recommendation);
						}
					});
					return recommendationObj.save().then(() => {
						return results;
					});
				} else {
					return [];
				}
			});
	}
};