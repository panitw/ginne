const moment = require('moment');
const reader = require('set-data-reader');
const PluginManager = require('../plugins/PluginManager');
const cache = PluginManager.getPlugin('cache');

module.exports = {
	execute: () => {
		let data = {};
		return cache.init()
			.then(() => {
				return reader.read();
			})
			.then((SETData) => {
				if (SETData) {
					for (let i=0; i<SETData.length; i++) {
						let item = SETData[i];
						data[item.symbol] = {
							d: moment.utc(item.date).startOf('day').toDate(),
							o: item.open,
							h: item.high,
							l: item.low,
							c: item.close,
							v: item.volume
						}
					}
				} else {
					throw new Error('Got no response from SET.or.th');
				}
			})
			.then(() => {
				let allPromises = [];
				for (let symbol in data) {
					let dataDate = moment(data[symbol].d).startOf('day').toDate();
					let dataNextDay = moment(dataDate).add(1, 'days').toDate();
					let promise = cache.getData(symbol, dataDate, dataNextDay)
						.then((dataAtDate) => {
							if (dataAtDate && dataAtDate.length > 0) {
								return cache.updateData(symbol, data[symbol]);
							} else {
								return cache.addData(symbol, [data[symbol]]);
							}
						});

					allPromises.push(promise);
				}
				return Promise.all(allPromises);
			});
	}
};