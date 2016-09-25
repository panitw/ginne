'use strict';

const moment = require('moment');
const DataProvider = require('../data/DataProvider');
const Analyzer = require('../pipeline/Analyzer');
const TodayExecutor = require('../execution/TodayExecutor');
const Recommendation = require('../execution/Recommendation');
const PluginManager = require('../plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');
const universe = PluginManager.getPlugin('universe');
const notification = PluginManager.getPlugin('notification');

module.exports = {
	execute: () => {
		//Get configured strategy
		return strategy.getStrategy()
			.then((strategy) => {
				let tradeStrategy = strategy;

				//Scan how long to read the historical data
				let analyzer = new Analyzer();
				tradeStrategy.analyze(analyzer);
				let screenerCmds = analyzer.commands();
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

				let derivedUniverse = universe.getUniverse(analyzer.universe());
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
									recommendationObj.recommendations.push(recommendation);
								}
							});
							return recommendationObj.save().then(() => {
								if (results.length > 0) {
									return notification.notify("There's new trade suggestion! Check it out http://ginne.ddns.net")
										.then(() => {
											return results;
										});
								} else {
									return results;
								}
							});
						} else {
							return [];
						}
					});
			});
	}
};