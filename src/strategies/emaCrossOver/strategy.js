'use strict';

const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener('SET');
scr1.addAnalysis('ema10', {
        type: 'EMA',
        field: 'close',
        input: {
            timePeriod: 10
        }
    })
    .mask('trade_signal', function (row, prevRow) {
        if (prevRow) {
            if (prevRow.close <= prevRow.ema10 && row.close > row.ema10) {
                return 'B';
            } else
            if (prevRow.close > prevRow.ema10 && row.close <= row.ema10) {
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

let action1 = new TradingActions();
action1
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
            row = ctx.latestData().row(symbol);
            if (row.trade_signal === 'S') {
                exitList.push(symbol);
                continue;
            }

            //Cut-loss
            position = ctx.positions()[symbol];
            if (row.last <= position.cutLossTarget) {
                exitList.push(symbol);
                continue;
            }
        }

        // Close the position for existing symbol
        for (let i=0;i< exitList.length; i++) {
            symbol = exitList[i];
            ctx.setPositionPercent(symbol, 0);
        }

        // Adjust the stop loss price using trailing stop
        for (symbol in ctx.positions) {
            row = ctx.latestData().row(symbol);
            position = ctx.positions[symbol];
            let gapPercent = (row.last - position.cutLossTarget) / row.last;
            if (gapPercent > cutLossPercent) {
                position.cutLossTarget = row.last - (row.last * cutLossPercent);
            }
        }

        // if the portfolio is empty, or less than the expected number of stocks
        // buy some more using the screening result (if there's some in the screening result)
        let morePosition = ctx.targetPositions() - ctx.positionCount();
        if (morePosition > 0) {
            let latestData = ctx.latestData();
            let buySignal = latestData.filter(function (row) {
                return row.trade_signal === 'B' && row.close >= 10 && row.close <= 50;
            });
            buySignal.sort('volume', 'd');
            let topSymbols = buySignal.index().slice(0, morePosition);
            for (let i=0; i<topSymbols.length; i++) {
                ctx.setPositionPercent(topSymbols[i], percentPositionSize);
            }
        }
    });

module.exports = {
    screener: scr1,
    tradingActions: action1
};