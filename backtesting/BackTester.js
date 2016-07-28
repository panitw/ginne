'use strict';

const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const async = require('async');

class BackTester {

    constructor (dataProvider) {
        this._dataProvider = dataProvider;
    }

    run (strategy, options) {
        let ctx = new Context(options);
        let screener = strategy.screener;
        let universeName = screener.universe();
        let screenCmd = screener.command();
        let tradeActions = strategy.tradeActions;
        
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);

        return new Promise((resolve, reject) => {
            async.eachSeries(universe,
                (item, callback) => {

                    screenCmd

                },
                (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve();
                    }
                }
            );
        });

    }

}

module.exports = BackTester;