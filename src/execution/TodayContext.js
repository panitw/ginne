'use strict';

const Context = require('./Context');
const PluginManager = require('../plugins/PluginManager');
const cache = PluginManager.getPlugin('cache');
const universe = PluginManager.getPlugin('universe');

class TodayContext extends Context {

	constructor (date, currentPositions) {
		let today = date;
		super({
			initialAsset: currentPositions.equity,
			start: today,
			end: today,
			targetPositions: 5,
			cutLossPercent: 0.1
		});
		var positions = {};
		currentPositions.positions.forEach((position) => {
			positions[position.symbol] = new Position(position.shares, position.price);
		});
		this.setPositions(positions);
		this.setCurrentDate(today);
		this.setUniverse(universe.getUniverse('SET'));
	}

	init () {
		let allPromises = [];
		for (let symbol in this.positions()) {
			var promise = cache.getLastData(symbol)
				.then(function (position, lastData) {
					if (lastData) {
						position.setLast(lastData.c);
					}
				}.bind(this, this.positions()[symbol]));
			allPromises.push(promise);
		}
		return Promise.all(allPromises);
	}

	endOfDayProcessing () {
		// Override to do nothing
	}
}

module.exports = TodayContext;