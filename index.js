const logger = require('winston');
const config = require('./config');
const DataProvider = require('./data/DataProvider');

let provider = new DataProvider(config.source.plugin, config.cache.plugin);
provider.getData("GOOG.O", new Date("2016-01-01"), new Date()).then(
	(data) => {
		logger.debug(data);
	}
);