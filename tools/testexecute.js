'use strict';

const moment = require('moment');
const logger = require('winston');
const mongoose = require('mongoose');
const TodayContext = require('../src/execution/TodayContext');
const TodayExecutor = require('../src/execution/TodayExecutor');
const Recommendation = require('../src/execution/Recommendation');
const DataProvider = require('../src/data/DataProvider');
const Analyzer = require("../src/pipeline/Analyzer");
const PluginManager = require('../src/plugins/PluginManager');
const universe = PluginManager.getPlugin('universe');

logger.level = 'debug';
mongoose.Promise = global.Promise;

let Strategy = require('../src/strategies/CurrentResearch');
let tradeStrategy = new Strategy();

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
			console.log("Results:");
			console.log(results);
		} else {
			console.log("No recommendation");
		}
	});

