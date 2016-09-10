'use strict';

const MongoClient = require('mongodb').MongoClient;
const logger = require('winston');
const moment = require('moment');

class MongoDBPlugin {

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

	getFirstData(symbol) {
		logger.debug('Getting first data point from MongoDB cache of ' + symbol);
		let symbolCol = this._getSymbolCollection(symbol);
		return symbolCol.find({}).sort({d: 1}).limit(1).next();
	}

	getLastData(symbol) {
		logger.debug('Getting last data point from MongoDB cache of ' + symbol);
		let symbolCol = this._getSymbolCollection(symbol);
		return symbolCol.find({}).sort({d: -1}).limit(1).next();
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

	addData(symbol, data) {
		logger.debug('Adding ' + data.length + ' data points of ' + symbol + ' to MongoDB cache');
		let symbolCol = this._getSymbolCollection(symbol);
		symbolCol.createIndex({d:1});
		return symbolCol.insertMany(data);
	}

	updateData (symbol, data) {
		logger.debug('Updating data of ' + symbol + ' at date ' + moment(data.d).format('YYYY-MM-DD') + 'to MongoDB cache');
		let symbolCol = this._getSymbolCollection(symbol);
		return symbolCol.update({d: {"$eq": moment(data.d).toDate()}}, data);
	}

	_getSymbolCollection(symbol) {
		symbol = symbol.replace('u.BK','').replace('.BK','');
		return this._db.collection(symbol);
	}

}

module.exports = MongoDBPlugin;