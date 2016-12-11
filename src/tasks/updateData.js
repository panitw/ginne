'use strict';

const moment = require('moment');
const reader = require('set-data-reader');
const PluginManager = require('../plugins/PluginManager');
const source = PluginManager.getPlugin('source');

module.exports = {
	execute: () => {
		let data = {};
		return source.init()
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
				return reader.readIndices();
			})
			.then((indices) => {
				for (let i=0; i<indices.length; i++) {
					let item = indices[i];
					data[item.symbol] = {
						d: moment.utc(item.date).startOf('day').toDate(),
						c: item.close
					}
				}
			})
			.then(() => {
				let allPromises = [];
				for (let symbol in data) {
					let dataDate = moment(data[symbol].d).startOf('day').toDate();
					let dataNextDay = moment(dataDate).add(1, 'days').toDate();
					let promise = source.getData(symbol, dataDate, dataNextDay)
						.then((dataAtDate) => {
							if (dataAtDate && dataAtDate.length > 0) {
								return source.updateData(symbol, data[symbol]);
							} else {
								return source.addData(symbol, [data[symbol]]);
							}
						});

					allPromises.push(promise);
				}
				return Promise.all(allPromises);
			});
	}
};