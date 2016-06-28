const logger = require('winston');
const config = require('./config');
const DataProvider = require('./data/DataProvider');

logger.level = 'debug';

let provider = new DataProvider(config);
provider.init().then(
	() => {
		provider.getData('TVO.BK', new Date('2016-05-01')).then(
			(data) => {
				for (var i=0;i<data.length;i++) {
					logger.info(JSON.stringify(data[i]));
				}
			}
		);
	},
	(err) => {
		logger.error(err);
	}
);