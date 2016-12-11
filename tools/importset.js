'use strict';

const fs = require('fs');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const set = require('./data/SETHD.json');

let mongo = null;

Promise.resolve(true)
	.then(() => {
		console.log('Connecting to MongoDB');
		return new Promise((resolve, reject) => {
			MongoClient.connect('mongodb://notemac/ginne', (err, db) => {
				if (err) {
					reject(err);
				} else {
					console.log('MongoDB database connection established');
					mongo = db;
					resolve();
				}
			});
		});
	})
	.then (() => {
		console.log('Importing ' + set.length + ' data points to MongoDB');
		return new Promise((resolve, reject) => {
			let symbolCol = mongo.collection('SETHD');
			async.eachSeries(set, (dataItem, callback) => {
				let data = {
					d: new Date(dataItem.Date),
					c: parseFloat(dataItem.Close)
				};
				symbolCol.save(data)
					.then(() => {
						callback();
					})
					.catch((err) => {
						callback(err);
					});
			}, (err) => {
				if (!err) {
					resolve();
				}
				reject(err);
			});
		});
	})
	.then(() => {
		console.log('Completed!');
	})
	.catch((err) => {
		console.error(err);
	});