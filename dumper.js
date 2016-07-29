'use strict';

const logger = require('winston');
logger.level = 'debug';

const async = require('async');
const DataProvider = require('./data/DataProvider');
const PluginManager = require('./plugins/PluginManager');
const universePlugin = PluginManager.getPlugin('universe');

let set = universePlugin.getUniverse('SET');
let provider = new DataProvider();
let last = 'MTLS.BK';
let lastIndex = set.indexOf(last);
set.splice(0, lastIndex + 1);

provider.init().then(() => {
	async.eachSeries(set, (ric, callback) => {
		provider.getData(ric, new Date('2000-01-01')).then((data) => {
			logger.info('Received data for ' + ric + ' waiting 15s for the next');
			setTimeout(() => {
				callback();
			}, 15000);
		});
	});
});
