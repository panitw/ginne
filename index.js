const logger = require('winston');
const config = require('./config');
const DataProvider = require('./data/DataProvider');

let provider = new DataProvider(config);
provider.getData("GOOG.O", new Date("2016-01-01")).then(
	(data) => {
		logger.debug(data);
	}
);