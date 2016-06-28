const moment = require('moment');
const async = require('async');
const logger = require('winston');
const PluginManager = require('../plugins/PluginManager');
const DataUtil = require('./DataUtil');

class DataProvider {

	constructor(config) {
		this._config = config;
		this._srcPlugin = PluginManager.getPlugin('source', this._config.source.plugin, this._config.source);
		this._cachePlugin = PluginManager.getPlugin('cache', this._config.cache.plugin, this._config.cache);
	}

	init() {
		return this._srcPlugin.init().then(() => {
			return this._cachePlugin.init();
		});
	}

	getData(symbol, startDate, endDate) {
		let firstDate = null;
		let lastDate = null;
		let catchUp = false;

		logger.debug('Getting data for ' + symbol);

		let promise = this._cachePlugin.getFirstData(symbol)
			.then((data) => {
				firstDate = (data) ? data.d : null;
				return this._cachePlugin.getLastData(symbol);
			})
			.then((data) => {
				lastDate = (data) ? data.d : null;
				if (!firstDate) {
					return this._srcPlugin.getData(symbol, startDate).then((data) => {
						catchUp = true;
						return this._cachePlugin.addData(symbol, data);
					});
				} else
				if (startDate.getTime() < firstDate.getTime()) {
					return this._srcPlugin.getData(symbol, startDate, firstDate).then((data) => {
						return this._cachePlugin.addData(symbol, data);
					});
				}
			})
			.then(() => {
				let today = moment().utc().startOf('day').toDate();
				if (!catchUp) {
					if (lastDate.getTime() < today.getTime()) {
						let afterLast = moment(lastDate).add('day', 1);
						return this._srcPlugin.getData(symbol, afterLast).then((data) => {
							return this._cachePlugin.addData(symbol, data);
						});
					}
				}
			})
			.then(() => {
				return this._cachePlugin.getData(symbol, startDate, endDate);
			});

		return promise;
	}

}

module.exports = DataProvider;