'use strict';

class LocalStrategy {

	constructor (config) {
		this._config = config;
	}

	init () {
		this._strategy = require('../../../strategies/' + this._config.strategy + '/strategy');
	}

	getStrategy () {
		return this._strategy;
	}
}

module.exports = LocalStrategy;