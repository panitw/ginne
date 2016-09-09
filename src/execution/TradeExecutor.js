const moment = require('moment');
const logger = require('winston');
const fin = require('fin-data');
const talib = require('talib');

class TradeExecutor {

	processScreener (ctx, screener) {
		let universe = ctx.universe();
		let allUniversePromises = universe.map((symbol) => {
			return this._dataProvider.getCachedData(symbol, ctx.startDate(), ctx.endDate())
				.then((data) => {
					logger.debug('Received data from MongoDB ' + symbol);
					ctx.setAnalyzedData(symbol, data);
					let commandPromises = screener.commands().map((cmdObj) => {
						if (cmdObj.cmd === 'ANALYSIS') {
							return this._addAnalysis(ctx, symbol, cmdObj.column, cmdObj.options);
						} else
						if (cmdObj.cmd === 'MASK') {
							return this._mask(ctx, symbol, cmdObj.column, cmdObj.func);
						}
					});
					return Promise.all(commandPromises);
				});
		});
		return Promise.all(allUniversePromises);
	}

	_addAnalysis (ctx, symbol, toColumn, options, callback) {
		return new Promise(function (resolve, reject) {
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
					reject(result.error);
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
					}
				}
				resolve();
			});
		});
	}

	_mask (ctx, symbol, toColumn, func) {
		return new Promise(function (resolve) {
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
			resolve();
		});
	}

	processTradingActions (ctx, tradingActions) {
		return new Promise((resolve) => {
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
			resolve();
		});
	}

}

module.exports = TradeExecutor;