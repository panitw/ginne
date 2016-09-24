'use strict';

const PluginManager = require('../src/plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');

strategy.deleteStrategy('c3a0f057c1835f8769b01b565ef78203')
	.then(() => {
		console.log('Deleted!');
	})
	.catch((err) => {
		console.error(err);
	});
