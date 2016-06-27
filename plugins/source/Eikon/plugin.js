const Eikon = require('./Eikon');
const moment = require('moment');

class UDFSource {

	constructor(config) {
		this._eikon = new Eikon(config.env);
	}

	getData(symbol, start, end) {
		var actualStart = null;
		var actualEnd = null;
		if (!start) {
			actualStart = moment().add(-1, 'years').toDate();
		}
		if (!end) {
			actualEnd = moment().toDate();
		}
		return new Promise((resolve, reject) => {
			this._eikon.postData('/Apps/UDF', {
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
				console.log(data);
			});
		});
	}

}

module.exports = UDFSource;