const PluginManager = require('../plugins/PluginManager');
const strategy = PluginManager.getPlugin('strategy');
const cache = PluginManager.getPlugin('cache');

module.exports = {
	execute: () => {

		//Get configured strategy
		let screener = strategy.getScreenerActions();
		let trading = strategy.getTradingActions();

		//Phase-I:
		// Read data to memory
		//  scan how long to read the historical data
		let screenerCmds = screener.commands();
		let maxPeriod = 20;
		for (let i=0; i<screenerCmds.length; i++) {
			if (screenerCmds[i].cmd === 'ANALYSIS') {
				let options = screenerCmds[i].options;
				if (options.input) {
					for (let inputName in options.input) {
						if (inputName.toUpperCase().indexOf('PERIOD') > -1) {
							maxPeriod = Math.max(maxPeriod, options.input[inputName]);
						}
					}
				}
			}
		}
		//  Times 2 to get enough data
		maxPeriod *= 2;
		console.log(maxPeriod);

		// Run screening actions

		//Phase-II: Create context and execution
		// Get current positions
		// Get commission model
		// Create context object
		//  getTargetPositions()
		//
	}
};