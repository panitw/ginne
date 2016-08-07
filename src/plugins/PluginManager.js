'use strict';

const argv = require('yargs').argv;
const path = require('path');

let configFile = 'config';
if (argv.config) {
	configFile = argv.config;
}

const config = require('../../' + configFile);

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