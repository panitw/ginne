const logger = require('winston');
const config = require('./config');
const DataProvider = require('./data/DataProvider');

logger.level = "debug";

let provider = new DataProvider(config);
provider.getData("GOOG.O").then(
	(data) => {
		logger.debug(data);
	}
);