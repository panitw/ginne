'use strict';

const TradeExecutor = require('./TradeExecutor');
const TodayContext = require('./TodayContext');

class TodayExecutor extends TradeExecutor {

	constructor () {
		super();
		this._dataProvider = new DataProvider();
	}

	run () {

		this._dataProvider.init()
			.then(() => {
				let context = new TodayContext();
			});
	}
}

module.exports = TodayExecutor;