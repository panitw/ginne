'use strict';

const logger = require('winston');
logger.level = 'debug';

const async = require('async');
const DataProvider = require('../src/data/DataProvider');
const PluginManager = require('../src/plugins/PluginManager');
const universePlugin = PluginManager.getPlugin('universe');

let set = universePlugin.getUniverse('SET_TR');
let provider = new DataProvider();
let last = '';
let lastIndex = set.indexOf(last);
set.splice(0, lastIndex + 1);

provider.init().then(() => {
	async.eachSeries(set, (ric, callback) => {
		var actualRic = ric;
		provider.getData(actualRic, new Date('2016-07-01')).then((data) => {
			logger.info('Received data for ' + actualRic + ' waiting 10s for the next');
			setTimeout(() => {
				callback();
			}, 1000);
		});
	});
});
