'use strict';

const moment = require('moment');
const logger = require('winston');
const fin = require('fin-data');
const PluginManager = require('../plugins/PluginManager');

class DataProvider {

	constructor () {
		this._srcPlugin = PluginManager.getPlugin('source');
		this._cachePlugin = PluginManager.getPlugin('cache');
	}

	init () {
		return this._srcPlugin.init().then(() => {
			return this._cachePlugin.init();
		});
	}

	getData (symbol, startDate, endDate, cacheOnly) {
		return this._getData(symbol, startDate, endDate, cacheOnly).then((data) => {
			return this._dataToDataFrame(data);
		});
	}

	getLastData (symbol) {
		return this._srcPlugin.getLastData(symbol);
	}

	_getData (symbol, startDate, endDate) {
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
						if (data.length > 0) {
							return this._cachePlugin.addData(symbol, data);
						}
					});
				} else
				if (startDate.getTime() < firstDate.getTime()) {
					let aDayBeforeFirst = moment(firstDate).add(-1, 'days');
					return this._srcPlugin.getData(symbol, startDate, aDayBeforeFirst.toDate()).then((data) => {
						if (data.length > 0) {
							return this._cachePlugin.addData(symbol, data);
						}
					});
				}
			})
			.then(() => {
				let today = moment().utc().startOf('day').toDate();
				if (!catchUp) {
					if (lastDate.getTime() < today.getTime()) {
						let afterLast = moment(lastDate).add(1, 'day');
						return this._srcPlugin.getData(symbol, afterLast).then((data) => {
							if (data.length > 0) {
								return this._cachePlugin.addData(symbol, data);
							}
						});
					}
				}
			})
			.then(() => {
				if (!endDate) {
					endDate = moment().add(1, 'day').utc().startOf('day').toDate();
				}
				return this._cachePlugin.getData(symbol, startDate, endDate);
			});

		return promise;
	}

	_dataToDataFrame(data) {
		var index = [];
		var open = [];
		var high = [];
		var low = [];
		var close = [];
		var volume = [];
		data.forEach((item) => {
			index.push(new Date(item.d));
			open.push(item.o);
			high.push(item.h);
			low.push(item.l);
			close.push(item.c);
			volume.push(item.v);
		});
		var dataFrame = new fin.DataFrame({
			open: new fin.Series(open, index),
			high: new fin.Series(high, index),
			low: new fin.Series(low, index),
			close: new fin.Series(close, index),
			volume: new fin.Series(volume, index)
		});
		return dataFrame;
	}
}

module.exports = DataProvider;