'use strict';

const mongoose = require('mongoose');
const PluginManager = require('../src/plugins/PluginManager');
const stateManager = PluginManager.getPlugin('state');

mongoose.Promise = global.Promise;

stateManager.getState()
	.then((state) => {
		console.log(state);
	});
