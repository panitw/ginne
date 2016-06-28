const MongoClient = require('mongodb').MongoClient;

class MongoDBPlugin {

	constructor(config) {
		this._config = config;
	}

	init() {
		MongoClient.connect(this._config.connectionString, (err, db) => {
			if (err) {
				throw err;
			} else {
				this._db = db;
			}
		});
	}

	getFirstDate(symbol) {
		var symbolCol = this._getSymbolCollection(symbol);
		
	}

	getData(symbol, start, end) {
		return new Promise((resolve, reject) => {
			resolve([]);
		});
	}

	addData(symbol, data) {
		
	}

	_getSymbolCollection(symbol) {
		symbol = symbol.replace('.','_');
		return this._db.collection(symbol);
	}

}

module.exports = MongoDBPlugin;