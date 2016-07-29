'use strict';

const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const logger = require('winston');
const async = require('async');
const moment = require('moment');
const fin = require('fin-data');
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

        return new Promise((resolve, reject) => {
            async.series([
                (callback) => {
                    this._processScreener(ctx, screener, callback);
                },
                (callback) => {
                    this._processTradingActions(ctx, tradingActions, callback);
                }
            ], (err) => {
                if (!err) resolve(); else reject(err);
            });
        });
    }

    _processScreener (ctx, screener, callback) {
        let universe = ctx.universe();
        async.eachSeries(universe, (symbol, callback) => {
            //Get basic time series data
            this._dataProvider.getCachedData(symbol, ctx.startDate(), ctx.endDate()).then((data) => {
                ctx.setAnalyzedData(symbol, data);

                //Add analysis as in the commands
                async.eachSeries(screener.commands(), (cmdObj, callback) => {
                    if (cmdObj.cmd === 'ANALYSIS') {
                        this._addAnalysis(ctx, symbol, cmdObj.column, cmdObj.options, callback);
                    } else
                    if (cmdObj.cmd === 'MASK') {
                        this._mask(ctx, symbol, cmdObj.column, cmdObj.options, callback);
                    }
                }, callback);
            });
        }, (err) => {
            callback(err);
        });
    }

    _addAnalysis(ctx, symbol, toColumn, options, callback) {
        let dataFrame = ctx.analyzedData(symbol);
        let startIdx = 0;
        let endIdx = dataFrame.count() - 1;

        //Prepare analysis object
        let taParam = {
            name: options.type,
            startIdx: startIdx,
            endIdx: endIdx
        };
        if (options.period) {
            taParam.optInTimePeriod = options.period;
        }
        if (options.field) {
            taParam.inReal = dataFrame.value(options.field);
        }
        taParam.open = dataFrame.value('open');
        taParam.high = dataFrame.value('high');
        taParam.low = dataFrame.value('low');
        taParam.close = dataFrame.value('close');
        taParam.volume = dataFrame.value('volume');

        talib.execute(taParam, (result) => {
            //Save data to data frame
            if (result && result.result) {
                let indices = dataFrame.index().slice(result.begIndex, result.begIndex + result.nbElement);
                let newSeries = new fin.Series(result.result.outReal, indices);
                dataFrame.addColumn(newSeries, toColumn);
            }
            callback();
        });
    }

    _mask(ctx, symbol, toColumn, options, callback) {
        callback();
    }

    _processTradingActions (ctx, tradingActions, callback) {
        callback();
    }

}

module.exports = BackTester;