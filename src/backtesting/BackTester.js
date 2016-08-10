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
            var result = null;
            async.series([
                (callback) => {
                    this._processScreener(ctx, screener, callback);
                },
                (callback) => {
                    this._processTradingActions(ctx, tradingActions, callback);
                },
                (callback) => {
                    ctx.closeAllPositions();
                    result = {
                        initialCapital: options.initialAsset,
                        endCapital: ctx.asset(),
                        netProfit: ctx.asset() - options.initialAsset,
                        percentNetProfit: ((ctx.asset() - options.initialAsset) / options.initialAsset) * 100,
                        //equityCurve: ctx.equityCurve(),
                        maximumDrawdown: ctx.equityCurve().maximumDrawdown('equity') * 100
                    };

                    //Compound Average Growth Return
                    let totalDays = moment(ctx.endDate()).diff(ctx.startDate(), 'days');
                    let totalYears = Math.round(totalDays / 365);
                    result.CAGRPercent = (Math.pow((result.endCapital / result.initialCapital), 1 / totalYears) - 1) * 100;

                    //Drawdown Duration
	                let ddDuration = ctx.equityCurve().drawdownDuration('equity');
	                let startIndex = ctx.equityCurve().indexAtLoc(ddDuration.startIndex);
	                let endIndex = ctx.equityCurve().indexAtLoc(ddDuration.endIndex);
	                let drawdownDays = moment(endIndex).diff(startIndex, 'days');
	                result.drawdownDuration = drawdownDays;

                    callback(null, result);
                }
            ], (err, result) => {
                if (!err) resolve(result[2]); else reject(err);
            });
        });
    }

    _processScreener (ctx, screener, callback) {
        let universe = ctx.universe();
        async.eachSeries(universe, (symbol, callback) => {
            //Get basic time series data
            this._dataProvider.getCachedData(symbol, ctx.startDate(), ctx.endDate()).then((data) => {
                logger.debug('Received data from MongoDB ' + symbol);

                ctx.setAnalyzedData(symbol, data);

                //Add analysis as in the commands
                async.eachSeries(screener.commands(), (cmdObj, callback) => {
                    if (cmdObj.cmd === 'ANALYSIS') {
                        this._addAnalysis(ctx, symbol, cmdObj.column, cmdObj.options, callback);
                    } else
                    if (cmdObj.cmd === 'MASK') {
                        this._mask(ctx, symbol, cmdObj.column, cmdObj.func);
                        callback();
                    }
                }, callback);
            });
        }, (err) => {
            callback(err);
        });
    }

    _addAnalysis (ctx, symbol, toColumn, options, callback) {
        let dataFrame = ctx.analyzedData(symbol);
        
        //Skip processing if there's no data
        if (dataFrame.count() <= 0) {
            callback();
            return;
        }

        let startIdx = 0;
        let endIdx = dataFrame.count() - 1;

        //Prepare analysis object
        let taParam = {
            name: options.type,
            startIdx: startIdx,
            endIdx: endIdx
        };
        if (options.input) {
            for (let inputName in options.input) {
                let upperFirst = inputName[0].toUpperCase() + inputName.substring(1);
                taParam['optIn' + upperFirst] = options.input[inputName];
            }
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
            if (result.error) {
                callback(result.error);
                return;
            } else
            if (result && result.result) {
                for (let resultName in result.result) {
                    let indices = dataFrame.index().slice(result.begIndex, result.begIndex + result.nbElement);
                    let newSeries = new fin.Series(result.result[resultName], indices);
                    let column = null;
                    if (resultName === 'outReal') {
                        column = toColumn;
                    } else {
                        column = toColumn + '_' + resultName.substring(3);
                    }
                    dataFrame.addColumn(newSeries, column);
                    //this._printCSV(dataFrame);
                }
            }
            callback();
        });
    }

    _mask (ctx, symbol, toColumn, func) {
        let dataFrame = ctx.analyzedData(symbol);
        let indices = dataFrame.index();
        if (indices.length > 0) {
            let prevRow = null;
            for (var i=0; i<indices.length; i++) {
                let row = dataFrame.row(indices[i]);
                let maskValue = func(row, prevRow);
                dataFrame.setValue(toColumn, indices[i], maskValue);
                prevRow = row;
            }
        }
    }

    _processTradingActions (ctx, tradingActions, callback) {
        //Loop through each day of the specified period
        let runner = ctx.startDate();
        let end = ctx.endDate();
        let lastValidRow = {};
        let prevData = null;

        while (runner.getTime() <= end.getTime()) {
            //Create a new data frame that contains the row of all the instrument in the universe
            let universe = ctx.universe();
            let dayData = new fin.DataFrame();
            let foundAnyData = false;
            for (let i=0; i<universe.length; i++) {
                let symbol = universe[i];
                let symbolData = ctx.analyzedData(symbol);
                let data = symbolData.row(runner);
                if (data) {
                    foundAnyData = true;
                    dayData.setRow(symbol, data);
                    lastValidRow[symbol] = data;
                }
            }

            //Consider the day as a valid day if there are some data, then
            //process each stage of event if there's any valid data for that day
            if (foundAnyData) {
                //Make sure that there's a row for each symbol in the universe, if not, use data from
                //last valid row
                let availableSymbols = dayData.index();
                for (let i=0; i<universe.length; i++) {
                    if (availableSymbols.indexOf(universe[i]) === -1) {
                        let lastValid = lastValidRow[universe[i]];
                        if (lastValid) {
                            dayData.setRow(universe[i], lastValid);
                        }
                    }
                }

                //Before Market Opened
                ctx.setCurrentDate(runner);
                if (prevData && dayData) {
                    ctx.setPreviousData(prevData);
                    ctx.setLatestData(dayData);
                    let handlers = tradingActions.handlers('marketOpen');
                    if (handlers && handlers.length > 0) {
                        for (let i=0; i<handlers.length; i++) {
                            handlers[i](ctx);
                        }
                    }
                }

                //Process EOD commission
                ctx.endOfDayProcessing();

                prevData = dayData;
            }
            
            runner = moment(runner).add(1, 'day').toDate();
        }
        callback();
    }

    _printCSV (dataFrame) {
        let output = [];
        let columns = dataFrame.column();
        console.log('"date",' + this._arrayToCSV(columns));

        let indices = dataFrame.index();
        for (let i=0; i<indices.length; i++) {
            let dataRow = dataFrame.row(indices[i]);
            let dataArray = [moment(indices[i]).format('YYYY-MM-DD')];
            for (let j=0; j<columns.length; j++) {
                dataArray.push(dataRow[columns[j]]);
            }
            console.log(this._arrayToCSV(dataArray));
        }
    }

    _arrayToCSV (array) {
        let output = JSON.stringify(array);
        output = output.substring(1);
        output = output.substring(0, output.length - 1);
        return output;
    }

}

module.exports = BackTester;