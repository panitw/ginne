class LocalStrategy {

	constructor (config) {
		this._config = config;
	}

	init () {
		this._strategy = require('../../../strategies/' + this._config.strategy + '/strategy');
	}

	getScreenerActions () {
		return this._strategy.screener;
	}

	getTradingActions () {
		return this._strategy.tradingActions;
	}
}

module.exports = LocalStrategy;