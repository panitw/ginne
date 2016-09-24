'use strict';

const fs = require('fs');
const csv = require('fast-csv');
const setReader = require('set-data-reader');
const async = require('async');
const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');

let mongo = null;
let symbols = null;
let tbImported = null;
let inputFile = process.argv[2];
let importedDate = moment.utc(process.argv[3]).toDate();

console.log('Reading symbol list from SET');
setReader.read()
	.then((data) => {
		symbols = data.map((item) => {
			return item.symbol;
		});
		symbols.sort();
	})
	.then(() => {
		console.log('Importing csv data from ' + inputFile);
		return new Promise((resolve, reject) => {
			let dataToBeImported = [];
			fs.createReadStream(inputFile)
				.pipe(csv())
				.on('data', (data) => {
					let symbol = data[0];
					if (symbols.indexOf(symbol) > -1) {
						dataToBeImported.push(data);
					}
				})
				.on('end', () => {
					tbImported = dataToBeImported;
					resolve();
				})
				.on('error', (err) => {
					reject(err);
				});
		});
	})
	.then(() => {
		console.log('Connecting to MongoDB');
		return new Promise((resolve, reject) => {
			MongoClient.connect('mongodb://localhost/ginne', (err, db) => {
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
		console.log('Importing ' + tbImported.length + ' data points to MongoDB');
		return new Promise((resolve, reject) => {
			async.eachSeries(tbImported, (dataItem, callback) => {
				let symbolCol = mongo.collection(dataItem[0]);
				console.log('Saving ' + dataItem[0]);
				let data = {
					d: importedDate,
					o: dataItem[2],
					h: dataItem[3],
					l: dataItem[4],
					c: dataItem[5],
					v: dataItem[6]
				}
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