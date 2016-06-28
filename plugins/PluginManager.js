const path = require('path');

const _instances = {};

class PluginManager {

	static getPlugin(type, name, config) {
		let key = type + "_" + name;
		if (!_instances[key]) {
			let PluginClass = require('./' + path.join(type, name, "plugin"));
			let instance = new PluginClass(config);
			instance.init();
			_instances[key] = instance;
		}
		return _instances[key];
	}

}

module.exports = PluginManager;