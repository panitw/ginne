'use strict';

const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener(['ADVANC']);
scr1.addAnalysis('ema10', {
        type: 'EMA',
        field: 'close',
        input: {
            timePeriod: 10
        }
    })
    .addAnalysis('ema20', {
        type: 'EMA',
        field: 'close',
        input: {
            timePeriod: 20
        }
    })
    .mask('trade_signal', function (row, prevRow) {
        if (prevRow) {
            if (prevRow.ema10 <= prevRow.ema20 && row.ema10 > row.ema20) {
                return 'B';
            } else
            if (prevRow.ema10 >= prevRow.ema20 && row.ema10 < row.ema20) {
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
        let cutLossPercent = ctx.cutLossPercent();
        let percentPositionSize = 1 / ctx.targetPositions();
        let exitList = [];
        let symbol, position, row;
        for (symbol in ctx.positions()) {
            //Exit signal
            row = ctx.previousData().row(symbol);
            if (row.trade_signal === 'S') {
                console.log('Exit Signal: ' + symbol);
                exitList.push(symbol);
                continue;
            }

            //Cut-loss
            position = ctx.positions()[symbol];
            if (row.close <= position.cutLossTarget()) {
                console.log('Cut-loss: ' + symbol);
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
        for (symbol in ctx.positions()) {
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
            let latestData = ctx.latestData();
            let buySignal = latestData.filter(function (row) {
                return row.trade_signal === 'B';
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