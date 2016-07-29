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
        let tradingActions = strategy.tradingActions;
        
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);
        let dateIndex = options.start;

        ctx.setUniverse(universe);
        ctx.setCurrentDate(dateIndex);

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
                        //Go to the next date if there's no error
                        if (!err) {
                            dateIndex = moment(dateIndex).add(1, 'day').toDate();
                            ctx.setCurrentDate(dateIndex);
                        }
                        callback(err);
                    });
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
                this._addAnalysis(ctx, ctx.universe(), cmdObj.column, cmdObj.options, callback);
            } else
            if (cmdObj.cmd === 'MASK') {
                this._mask(ctx, ctx.universe(), cmdObj.column, cmdObj.options, callback);                
            }
        }, callback);
    }

    _addAnalysis(ctx, universe, toColumn, options, callback) {
        async.eachSeries(universe, (symbol, callback) => {
            //data query period
            let start = ctx.currentDate();
            let end = start;
            let startIdx = 0;
            let endIdx = 0;
            if (options.period) {
                end = options.period;
                endIdx = options.period - 1;
            }
            if (options.offset < 0) {
                end -= options.offset;
            }
            this._dataProvider.getCachedData(symbol, start, end).then((data) => {
                //Prepare analysis object
                let taParam = {
                    name: options.type,
                    startIdx: 0,
                    endIdx: endIdx,
                    optInTimePeriod: options.period
                };
                if (options.field) {
                    taParam.inReal = data.value(options.field);
                }
                taParam.open = data.value('open');
                taParam.high = data.value('high');
                taParam.low = data.value('low');
                taParam.close = data.value('close');
                taParam.volume = data.value('volume');

                talib.execute(taParam, (result) => {
                    //Save data to data frame
                    let internalTaParam = taParam;
                    if (result && result.result) {
                        let resultLoc = 0;
                        if (options.period) {
                            resultLoc = (options.period - 1) - result.begIndex;
                        }
                        let resultValue = result.result.outReal[resultLoc];
                        ctx.screened().setValue(toColumn, symbol, resultValue);
                    }

                    //Go to the next symbol
                    callback();
                });
            }).catch((err) => {
                callback(err);
            });
        }, (err) => {
            callback(err);
        });
    }

    _mask(ctx, universe, toColumn, options, callback) {
        callback();
    }

    _processTradingActions (ctx, tradingActions, callback) {
        callback();
    }

}

module.exports = BackTester;