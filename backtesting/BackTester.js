'use strict';

const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const logger = require('winston');
const async = require('async');
const moment = require('moment');

class BackTester {

    constructor (dataProvider) {
        this._dataProvider = dataProvider;
    }

    run (strategy, options) {
        let ctx = new Context(options);
        let screener = strategy.screener;
        let universeName = screener.universe();
        let screenCmd = screener.commands();
        let tradeActions = strategy.tradeActions;
        
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);

        let dateIndex = options.start;

        return new Promise((resolve, reject) => {
            
            async.whilst(
                () => {
                    return dateIndex.getTime() <= options.end.getTime();
                },
                (callback) => {
                    logger.debug('Processing ' + moment(dateIndex).format('DD-MM-YYYY'));

                    //Go to the next date
                    dateIndex = moment(dateIndex).add(1, 'day').toDate();
                    callback();
                },
                (err) => {
                    if (!err) resolve(); else reject(err);
                }
            );

            // async.eachSeries(universe,
            //     (item, callback) => {
            //
            //     },
            //     (err) => {
            //        if (!err) resolve(); else reject(err);
            //     }
            // );
        });

    }

}

module.exports = BackTester;