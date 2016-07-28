'use strict';

const path = require('path');
const config = require('../config');

const _instances = {};

class PluginManager {

	static getPlugin(type) {
		let name = config[type].plugin;
		let key = type + "_" + name;
		if (!_instances[key]) {
			let PluginClass = require('./' + path.join(type, name, "plugin"));
			let instance = new PluginClass(config[type]);
			_instances[key] = instance;
		}
		return _instances[key];
	}

}

module.exports = PluginManager;