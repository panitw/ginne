'use strict';

class Strategy {

	analyze (analyzer) {
		analyzer.setUniverse('SET')
			.addAnalysis('max', {
				type: 'MAX',
				field: 'close',
				input: {
					timePeriod: 80
				}
			})
			.addAnalysis('min', {
				type: 'MIN',
				field: 'close',
				input: {
					timePeriod: 40
				}
			})
			.addAnalysis('sma', {
				type: 'SMA',
				field: 'close',
				input: {
					timePeriod: 25
				}
			})
			.addAnalysis('rsi', {
				type: 'RSI',
				field: 'close',
				input: {
					timePeriod: 5
				}
			})
			.mask('enough_volume', function (row) {
				if (row) {
					if (row.volume > 100000) {
						return 'Y';
					} else {
						return 'N';
					}
				} else {
					return '-';
				}
			})
			.mask('trade_signal', function (row, prevRow) {
				if (row && prevRow) {
					if (!isNaN(prevRow.max) && (row.close > prevRow.max && row.close >= row.sma)) {
						return 'B';
					} else
					if (!isNaN(prevRow.min) && (row.close < prevRow.min || (prevRow.rsi > 80 && row.rsi <= 80))) {
						return 'S';
					} else {
						return '-';
					}
				} else {
					return '-';
				}
			})
			.mask('higher_ratio', function (row) {
				if (row && row.close !== 0) {
					return (row.close - row.max) / row.close;
				} else {
					return 0;
				}
			});
	}

	execute (executor) {
		executor.on('marketOpen', function (ctx) {
			let cutLossPercent = ctx.cutLossPercent();
			let percentPositionSize = 1 / ctx.targetPositions();
			let exitList = [];
			let symbol, position, row;
			for (symbol in ctx.positions()) {
				//Exit signal
				row = ctx.latestData().row(symbol);
				if (row.trade_signal === 'S') {
					exitList.push(symbol);
					continue;
				}

				//Cut-loss
				position = ctx.positions()[symbol];
				let cutLossTarget = ctx.value('CUTLOSS_' + symbol);
				if (row.close <= cutLossTarget) {
					exitList.push(symbol);
					continue;
				}

			}

			// Close the position for existing symbol.
			for (let i=0;i< exitList.length; i++) {
				symbol = exitList[i];
				if (ctx.canTrade(symbol)) {
					ctx.setPositionPercent(symbol, 0);
				} else {
					console.log('Can\'t sell ' + symbol + ' on ' + ctx.currentDate());
				}
			}

			// Adjust the stop loss price using trailing stop
			for (symbol in ctx.positions()) {
				let cutLossTarget = ctx.value('CUTLOSS_' + symbol);
				row = ctx.latestData().row(symbol);
				position = ctx.positions()[symbol];
				let gapPercent = (row.close - cutLossTarget) / row.close;
				if (gapPercent > cutLossPercent) {
					ctx.setValue('CUTLOSS_' + symbol, row.close - (row.close * cutLossPercent));
				}
			}

			// if the portfolio is empty, or less than the expected number of stocks
			// buy some more using the screening result (if there's some in the screening result)
			let morePosition = ctx.targetPositions() - ctx.positionCount();
			if (morePosition > 0) {
				let latestData = ctx.latestData();
				let buySignal = latestData.filter(function (row, symbol) {
					return row.trade_signal === 'B' && row.enough_volume === 'Y' && !ctx.positions()[symbol];
				});
				buySignal.sort('higher_ratio', 'd');
				let topSymbols = buySignal.index().slice(0, morePosition);
				for (let i=0; i<topSymbols.length; i++) {
					if (ctx.canTrade(topSymbols[i])) {
						ctx.setPositionPercent(topSymbols[i], percentPositionSize);
					} else {
						console.log('Can\'t buy ' + symbol + ' on ' + ctx.currentDate());
					}
				}
			}
		});
	}
}

module.exports = Strategy;