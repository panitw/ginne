const moment = require('moment');
const PluginManager = require('../plugins/PluginManager');
const DataUtil = require('./DataUtil');

class DataProvider {

	constructor(config) {
		this._config = config;
		this._srcPlugin = PluginManager.getPlugin('source', this._config.source.name, this._config.source);
		this._cachePlugin = PluginManager.getPlugin('cache', this._config.cache.name, this._config.cache);
	}

	getData(symbol, startDate, endDate) {
		return new Promise((resolve, reject) => {
			
			//Check the oldest point in the cache. 

			//Compare oldest point with the start date

			//If the startDate is null or oldest point is greater or equal than the start date, get data from
			//the source
			
			this._cachePlugin.getData(symbol, startDate, endDate).then(
				(data) => {
					data.sort(DataUtil.sort('a'));
					if (data) {

					}
					resolve(data);
				},
				(err) => {

				}
			);
		});
	}

}

module.exports = DataProvider;