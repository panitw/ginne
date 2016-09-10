'use strict';

const moment = require('moment');
const TradeExecutor = require('./TradeExecutor');
const TodayContext = require('./TodayContext');
const PluginManager = require('../plugins/PluginManager');
const portfolio = PluginManager.getPlugin('portfolio');
const cache = PluginManager.getPlugin('cache');
const universe = PluginManager.getPlugin('universe');

class TodayExecutor extends TradeExecutor {

	constructor (date, dataProvider) {
		super(dataProvider);
		this._context = null;
		this._today = date;
	}

	run (strategy, universe, numberOfDaysBack) {
		let currentPositions = null;
		return portfolio.getPositions()
			.then((positions) => {
				if (!positions) {
					positions = [];
				}
				currentPositions = positions;
			})
			.then(() => {
				let endDate = moment(this._today).add(-1 * numberOfDaysBack, 'days').toDate();
				this._context = new TodayContext(this._today, currentPositions);
				this._context.setUniverse(universe);
				this._context.setEndDate(endDate);
				return this.processScreener(this._context, strategy.screener);
			})
			.then(() => {
				this._context.setEndDate(this._today);
				return this.processTradingActions(this._context, strategy.tradingActions);
			})
			.then(() => {
				return this._context.transactions();
			});
	}

}

module.exports = TodayExecutor;