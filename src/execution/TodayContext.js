'use strict';

const Context = require('./Context');
const PluginManager = require('../plugins/PluginManager');
const universe = PluginManager.getPlugin('universe');

class TodayContext extends Context {

	constructor (dataProvider, date, currentPositions, commissionModel) {
		let today = date;
		super({
			initialAsset: currentPositions.equity,
			start: today,
			end: today,
			targetPositions: 5,
			cutLossPercent: 0.1,
			tradeCommission: commissionModel.percent,
			minDailyCommission: commissionModel.minimumPerDay,
			vat: commissionModel.vat
		});
		var positions = {};
		currentPositions.positions.forEach((position) => {
			positions[position.symbol] = new Position(position.shares, position.price);
		});
		this._dataProvider = dataProvider;
		this.setPositions(positions);
		this.setCurrentDate(today);
		this.setUniverse(universe.getUniverse('SET'));
	}

	init () {
		let allPromises = [];
		for (let symbol in this.positions()) {
			var promise = this._dataProvider.getLastData(symbol)
				.then(function (position, lastData) {
					if (lastData) {
						position.setLast(lastData.c);
					}
				}.bind(this, this.positions()[symbol]));
			allPromises.push(promise);
		}
		return Promise.all(allPromises);
	}

	setPositionPercent (symbol, percent) {
		super.setPositionPercent(symbol, percent, false, 'close');
	}

	endOfDayProcessing () {
		// Override to do nothing
	}
}

module.exports = TodayContext;