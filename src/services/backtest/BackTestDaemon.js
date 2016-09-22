'use strict';

const BackTestClient = require('./BackTestClient');
const logger = require('winston');

class BackTestDaemon {

	constructor (dataProvider) {
		this._client = null;
		this._dataProvider = dataProvider;
	}

	handle (socket) {
		if (!this._client) {
			logger.info('New client connected');
			this._client = new BackTestClient(this._dataProvider, socket);
		} else {
			this._client.setSocket(socket);
		}
	}

}

module.exports = BackTestDaemon;