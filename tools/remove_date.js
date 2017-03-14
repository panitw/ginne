'use strict';

const MongoClient = require('mongodb').MongoClient;
const config = require('../config');
const async = require('async');

console.log('Initialize MongoDB database connection');

MongoClient.connect('mongodb://notemac/ginne', (err, db) => {
	if (err) {
		reject(err);
	} else {
		console.log('MongoDB database connection established');

		let symbols = require('./SET');
		
		async.eachSeries(symbols, 
			(symbol, callback) => {
				console.log('Deleteting date for '+symbol);
				let collection = db.collection(symbol);
				collection.findOne({d: {"$eq": new Date('2023-01-17 00:00:00.000Z')}}).then((data) => {
					if (data) {
						console.log('Found the invalid data');
						collection.remove({_id: data._id})
							.then(() => {
								console.log('Remove success');
								callback();
							})
							.catch((err) => {
								callback(err)
							})
					} else {
						console.log('Invalid data not found');
						callback();
					}
				}).catch((ex) => {
					console.err(ex);
					callback();
				});
			},
			(err) => {
				db.close();
			}
		);
	}
});