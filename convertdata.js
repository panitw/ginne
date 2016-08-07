'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('./config');
const async = require('async');
const moment = require('moment');
const set = require('./src/plugins/universe/Static/SET');

class Converter {

	constructor(config) {
		this._config = config;
	}

	init() {
		console.log('Initialize MongoDB database connection');
		return new Promise((resolve, reject) => {
			MongoClient.connect(this._config.connectionString, (err, db) => {
				if (err) {
					reject(err);
				} else {
					console.log('MongoDB database connection established');
					this._db = db;
					resolve();
				}
			});			
		});
	}

	getData(symbol, start, end) {
		if (typeof end === 'number') {
			console.log('Getting data from MongoDB cache of ' + symbol + ' from ' + moment(start).format("YYYY-MM-DD") + ' going back ' + end + ' days');
			let symbolCol = this._getSymbolCollection(symbol);
			return symbolCol.find({d: {$lte: start}}).sort({d: -1}).limit(end).toArray();
		} else {
			console.log('Getting data from MongoDB cache of ' + symbol + ' from ' + moment(start).format("YYYY-MM-DD") + ' to ' + moment(end).format("YYYY-MM-DD"));
			let symbolCol = this._getSymbolCollection(symbol);
			return symbolCol.find({d: {$gte: start, $lt: end}}).sort({d: -1}).toArray();
		}
	}

	saveData(symbol, data, callback) {
            console.log('Updating ' + data.length + ' data points of ' + symbol + ' to MongoDB cache');
            let symbolCol = this._getSymbolCollection(symbol);
            async.eachSeries(data, (dataItem, callback) => {
                symbolCol.save(dataItem)
                         .then(() => {
                            callback();
                         })
                         .catch((err) => {
                             callback(err);
                         });
            }, (err) => {
                if (!err) {
                    console.log('Sucessfully update ' + symbol);
                }
            });
	}

	_getSymbolCollection(symbol) {
		symbol = symbol.replace('.','_');
		return this._db.collection(symbol);
	}

}

let converter = new Converter(config.cache);
converter.init().then(() => {
    async.eachSeries(set, (symbol, callback) => {
        converter.getData(symbol, new Date('2000-01-01'), new Date())
                 .then((data) => {
                     let converted = data.map((row) => {
                         row.o = parseFloat(row.o);
                         row.h = parseFloat(row.h);
                         row.l = parseFloat(row.l);
                         row.c = parseFloat(row.c);
                         row.v = parseFloat(row.v);
                         return row;
                     });
                     converter.saveData(symbol, converted, callback);
                 })
                 .catch((err) => {
                     callback(err);
                 });
    }, (err) => {
        if (!err) {
            console.log('Successfully converted all the data');
        } else {
            console.log('Error: ' + err);
        }
    });
});