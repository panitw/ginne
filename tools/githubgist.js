'use strict';

const PluginManager = require('../src/plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');

strategy.createStrategy('Test Invalid', 'function Strategy() {this.analyze = function() {}; this.execute = function () {};}')
	.then(() => {
		console.log('Created!')
	})
	.catch((err) => {
		console.error(err);
	});