'use strict';

const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener(['ADVANC']);
scr1.addAnalysis('sma', {
		type: 'SMA',
		field: 'close',
		input: {
			timePeriod: 20
		}
	})
	.addAnalysis('slope', {
		type: 'LINEARREG_SLOPE',
		field: 'close',
		input: {
			timePeriod: 10
		}
	})
	.mask('upper_bound', function (row) {
		if (row && row.sma) {
			return row.sma + (row.sma * 0.1);
		} else {
			return NaN;
		}
	})
	.mask('lower_bound', function (row) {
		if (row && row.sma) {
			return row.sma - (row.sma * 0.1);
		} else {
			return NaN;
		}
	})
	.mask('higher_ratio', function (row) {
		if (row && row.upper_bound) {
			return (row.close - row.upper_bound) / row.upper_bound;
		} else {
			return 0;
		}
	})
	.mask('trade_signal', function (row) {
		if (row) {
			if (row.close > row.upper_bound) {
				return 'B';
			} else
			if (row.close < row.lower_bound) {
				return 'S';
			} else {
				return '-';
			}
		} else {
			return '-';
		}
	});
// --------------------------
//      Trading Actions
// --------------------------

let actions1 = new TradingActions();
actions1
	.on('marketOpen', function (ctx) {
		// Validate all entries if we need to exit any position and exit if need to
		// Exit Criteria:
		//  - exit signal
		//  - cut loss
		let cutLossPercent = 0.1;
		let percentPositionSize = 1 / ctx.targetPositions();
		let exitList = [];
		let symbol, position, row;
		for (symbol in ctx.positions()) {
			//Exit signal
			row = ctx.previousData().row(symbol);
			if (row.trade_signal === 'S') {
				exitList.push(symbol);
				continue;
			}

			//Cut-loss
			position = ctx.positions()[symbol];
			if (row.close <= position.cutLossTarget()) {
				exitList.push(symbol);
				continue;
			}
		}

		// Close the position for existing symbol
		for (let i=0;i< exitList.length; i++) {
			symbol = exitList[i];
			if (ctx.canTrade(symbol)) {
				ctx.setPositionPercent(symbol, 0);
			} else {
				console.log('Can\'t sell ' + symbol + ' on ' + ctx.currentDate());
			}
		}

		// Adjust the stop loss price using trailing stop
		for (symbol in ctx.positions) {
			row = ctx.previousData().row(symbol);
			position = ctx.positions()[symbol];
			let gapPercent = (row.close - position.cutLossTarget()) / row.close;
			if (gapPercent > cutLossPercent) {
				position.setCutLossTarget(row.close - (row.close * cutLossPercent));
			}
		}

		// if the portfolio is empty, or less than the expected number of stocks
		// buy some more using the screening result (if there's some in the screening result)
		let morePosition = ctx.targetPositions() - ctx.positionCount();
		if (morePosition > 0) {
			let prevData = ctx.previousData();
			let buySignal = prevData.filter(function (row, symbol) {
				return row.trade_signal === 'B' && !ctx.positions()[symbol] && row.slope > 0.2;
			});
			buySignal.sort('higher_ratio', 'a');
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

module.exports = {
	screener: scr1,
	tradingActions: actions1
};