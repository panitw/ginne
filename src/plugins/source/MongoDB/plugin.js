'use strict';

const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');
const logger = require('winston');

class MongoDBSource {

	constructor(config) {
		this._config = config;
	}

	init() {
		logger.debug('Cache Plugin: Initialize MongoDB database connection. Use ' + this._config.connectionString);
		return new Promise((resolve, reject) => {
			if (!this._db) {
				MongoClient.connect(this._config.connectionString, (err, db) => {
					if (err) {
						reject(err);
					} else {
						logger.debug('MongoDB database connection established');
						this._db = db;
						resolve();
					}
				});
			} else {
				resolve();
			}
		});
	}

	getData(symbol, start, end) {
		if (typeof end === 'number') {
			logger.debug('Getting data from MongoDB cache of ' + symbol + ' from ' + moment(start).format("YYYY-MM-DD") + ' going back ' + end + ' days');
			let symbolCol = this._getSymbolCollection(symbol);
			return symbolCol.find({d: {$lte: start}}, {_id: 0}).sort({d: -1}).limit(end).toArray();
		} else {
			logger.debug('Getting data from MongoDB cache of ' + symbol + ' from ' + moment(start).format("YYYY-MM-DD") + ' to ' + moment(end).format("YYYY-MM-DD"));
			let symbolCol = this._getSymbolCollection(symbol);
			return symbolCol.find({d: {$gte: start, $lt: end}}, {_id: 0}).sort({d: -1}).toArray();
		}
	}

}

module.exports = MongoDBSource;