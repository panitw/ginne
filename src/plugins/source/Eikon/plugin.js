'use strict';

const Eikon = require('./Eikon');
const moment = require('moment');
const logger = require('winston');
const SETTR = require('../../universe/Static/SET_TR');

class UDFSource {

	constructor(config) {
		this._eikon = new Eikon(config.environment);
	}

	init() {
		return new Promise((resolve) => { resolve(); });
	}

	getData(symbol, start, end) {
		logger.debug('Getting data from Eikon UDF source of ' + symbol + ' from ' + moment(start).format("YYYY-MM-DD") + ' to ' + moment(end).format("YYYY-MM-DD"));
		var actualStart = null;
		var actualEnd = null;
		if (!start) {
			actualStart = moment().add(-1, 'years').toDate();
		} else {
			actualStart = start;
		}
		if (!end) {
			actualEnd = moment().toDate();
		} else {
			actualEnd = end;
		}
		return new Promise((resolve, reject) => {
			this._eikon.postData('/Apps/UDF/MSF', {
				"Entity": {
					"ID": "TATimeSeries",
					"E": "TATimeSeries",
					"W": {
						"Tickers": [
							symbol
						],
						"NoInfo": true,
						"Interval": "Daily",
						"StartDate": actualStart.toISOString(),
						"EndDate": actualEnd.toISOString(),
						"Analysis": [
							"OHLCV"
						],
						"AnalysisParams": {}
					}
				}
			}).then((data) => {
				var output = data.TATimeSeries.R[0].Data.map((item) => {
					return {
						d: new Date(item.Date),
						o: item.Open,
						h: item.High,
						l: item.Low,
						c: item.Close,
						v: item.Volume
					}
				});
				resolve(output);
			});
		});
	}

}

module.exports = UDFSource;