'use strict';

const moment = require('moment');
const fin = require('fin-data');
const TradeExecutor = require('./TradeExecutor');
const TodayContext = require('./TodayContext');
const PluginManager = require('../plugins/PluginManager');
const portfolio = PluginManager.getPlugin('portfolio');
const universe = PluginManager.getPlugin('universe');

class TodayExecutor extends TradeExecutor {

	constructor (date, dataProvider) {
		super(dataProvider);
		this._context = null;
		this._today = date;
	}

	run (strategy, universe, numberOfDaysBack) {
		let currentPositions = null;
		let commissionModel = null;
		let analyzer = new Analyzer();
		let tradingActions = new TradingActions();
		strategy.analyze(analyzer);
		strategy.execute(tradingActions);

		return portfolio.getPositions()
			.then((positions) => {
				if (!positions) {
					positions = [];
				}
				currentPositions = positions;
			})
			.then(() => {
				return portfolio.getCommissionModel(this._today);
			})
			.then((commission) => {
				commissionModel = commission;
				let startDate = moment(this._today).add(-1 * numberOfDaysBack, 'days').toDate();
				this._context = new TodayContext(this._dataProvider, this._today, currentPositions, commissionModel);
				this._context.setUniverse(universe);
				this._context.setStartDate(startDate);
				return this.processScreener(this._context, analyzer);
			})
			.then(() => {
				this._context.setStartDate(this._today);
				return this.processTradingActions(this._context, tradingActions);
			})
			.then(() => {
				return this._context.transactions();
			});
	}

	processTradingActions (ctx, tradingActions) {
		ctx.setCurrentDate(this._today);

		let universe = ctx.universe();
		let dayData = new fin.DataFrame();
		let foundAnyData = false;
		for (let i=0; i<universe.length; i++) {
			let symbol = universe[i];
			let symbolData = ctx.analyzedData(symbol);
			let lastIndex = symbolData.indexAtLoc(symbolData.count() - 1);
			let data = symbolData.row(lastIndex);
			if (data) {
				foundAnyData = true;
				dayData.setRow(symbol, data);
			}
		}

		//Consider the day as a valid day if there are some data, then
		//process each stage of event if there's any valid data for that day
		if (foundAnyData) {
			ctx.setLatestData(dayData);
			let handlers = tradingActions.handlers('marketOpen');
			if (handlers && handlers.length > 0) {
				for (let i=0; i<handlers.length; i++) {
					handlers[i](ctx);
				}
			}
		}

	}

}

module.exports = TodayExecutor;