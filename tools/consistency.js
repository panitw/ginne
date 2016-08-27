'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('../config');
const async = require('async');
const moment = require('moment');
const setReader = require('set-data-reader');

console.log('Initialize MongoDB database connection');

MongoClient.connect(config.cache.connectionString, (err, db) => {
	if (err) {
		reject(err);
	} else {
		console.log('MongoDB database connection established');
		console.log('Reading data from SET.or.th');

		setReader.read().then(function (data) {
			console.log('Received data from SET.or.th');
			async.eachSeries(data, 
				(item, callback) => {
					console.log('Checking consistency of '+item.symbol);
					let collection = db.collection(item.symbol);
					collection.findOne({d: {"$eq": new Date('2016-08-26T00:00:00.000Z')}}).then((data) => {
						if (item.open === data.o &&
							item.high === data.h &&
							item.low === data.l &&
							item.close === data.c) {
							console.log('OK');
						} else {
							console.log('NOT OK');
							console.log('  db :', data);
							console.log('  set:', item);
						}
						callback();
					}).catch((ex) => {
						console.err(ex);
						callback();
					});
				},
				(err) => {

				}
			);
		});
	}
});