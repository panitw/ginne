'use strict';

const PluginManager = require('../src/plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');

strategy.getStrategy()
	.then((code) => {
		console.log(code);
	})
	.catch((err) => {
		console.error(err);
	});
