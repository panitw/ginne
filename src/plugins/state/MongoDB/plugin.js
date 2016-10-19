'use strict';

const MongoClient = require('mongodb').MongoClient;
const logger = require('winston');

class StateManager {

	constructor(config) {
		this._config = config;
	}

	init() {
		return new Promise((resolve, reject) => {
			if (!this._db) {
				logger.debug('State Plugin: Initialize MongoDB database connection. Use ' + this._config.connectionString);
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

	getState () {
		return this.init()
			.then(() => {
				let col =  this._db.collection('executionstates');
				return col.find({}).limit(1).next();
			});
	}

	setState (stateObj) {
		return this.init()
			.then(() => {
				let col =  this._db.collection('executionstates');
				return col.find({}).limit(1).next()
					.then((currentState) => {
						if (currentState !== null) {
							return col.remove({_id: currentState._id});
						}
					})
					.then(() => {
						return col.insert(stateObj);
					});
			});
	}

}

module.exports = StateManager;