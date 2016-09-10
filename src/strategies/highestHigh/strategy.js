'use strict';

const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener(['ADVANC']);
scr1.addAnalysis('max', {
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
    .mask('enough_volume', function (row) {
        if (row) {
            if (row.volume > 10000) {
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
            if (!isNaN(prevRow.max) && row.close > prevRow.max) {
                return 'B';
            } else
            if (!isNaN(prevRow.min) && row.close < prevRow.min) {
                return 'S';
            } else {
                return '-';
            }
        } else {
            return '-';
        }
    })
    .mask('higher_ratio', function (row) {
        if (row) {
            return (row.close - row.max) / row.close;
        } else {
            return 0;
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
        let cutLossPercent = ctx.cutLossPercent();
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
            let prevData = ctx.previousData();
            let buySignal = prevData.filter(function (row, symbol) {
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

module.exports = {
    screener: scr1,
    tradingActions: actions1
};