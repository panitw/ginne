'use strict';

const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const logger = require('winston');
const async = require('async');
const moment = require('moment');
const talib = require('talib');

class BackTester {

    constructor (dataProvider) {
        this._dataProvider = dataProvider;
    }

    run (strategy, options) {
        let ctx = new Context(options);
        let screener = strategy.screener;
        let universeName = screener.universe();
        let tradeActions = strategy.tradeActions;
        
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);

        let dateIndex = options.start;

        return new Promise((resolve, reject) => {
            
            //Process each day
            async.whilst(
                () => {
                    return dateIndex.getTime() <= options.end.getTime();
                },
                (callback) => {
                    logger.debug('Processing ' + moment(dateIndex).format('DD-MM-YYYY'));

                    async.series([
                        (callback) => {
                            this._processScreener(ctx, screener, callback);
                        },
                        (callback) => {
                            this._processTradingActions(ctx, tradingActions, callback);
                        }
                    ], (err) => {
                        callback(err);
                    });

                    //Go to the next date
                    dateIndex = moment(dateIndex).add(1, 'day').toDate();
                    ctx.setCurrentDate(dateIndex);
                    callback();
                },
                (err) => {
                    if (!err) resolve(); else reject(err);
                }
            );

        });

    }

    _processScreener (ctx, screener, callback) {
        async.eachSeries(screener.commands(), (cmdObj, callback) => {
            if (cmdObj.cmd === 'ANALYSIS') {
                this._addAnalysis(ctx, screener.universe(), cmdObj.column, cmdObj.options, callback);
            } else
            if (cmdObj.cmd === 'MASK') {
                this._mask(ctx, screener.universe(), cmdObj.column, cmdObj.options, callback);                
            }
        }, callback);
    }

    _addAnalysis(ctx, universe, toColumn, options, callback) {
        async.eachSeries(universe, (symbol, callback) => {
            //data query period
            let start = ctx.currentDate();
            let end = start;
            if (options.period) {
                end = options.period;
            }
            let data = this._dataProvider.getCachedData(symbol, start, end);

            //Prepare Data
            let taParam = {
                name: options.type,
                optInTimePeriod: options.period
            };

        }, (err) => {
            callback(err);
        });
    }

    _mask(universe, toColumn, options, callback) {

    }

    _processTradingActions (ctx, tradingActions, callback) {
        callback();
    }

}

module.exports = BackTester;