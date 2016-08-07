const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener(['ADVANC.BK']);
scr1.addAnalysis('ema10', {
        type: 'EMA',
        field: 'close',
        input: {
            timePeriod: 10
        }
    })
    .mask('trend_signal', function (row, prevRow) {
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

var actions1 = new TradingActions();
actions1
    .on('marketOpen', function (ctx) {
        // Validate all entries if we need to exit any position and exit if need to
        // Exit Criteria:
        //  - exit signal        
        //  - cut loss
        var cutLossPercent = 0.1;
        var percentPositionSize = 1 / ctx.targetPositions;
        var exitList = [];
        var symbol, position, row;
        for (symbol in ctx.positions) {
            //Exit signal
            row = ctx.screened().row(symbol);
            if (row['trade_signal'] === false) {
                exitList.push(symbol);
                continue;
            }

            //Cut-loss
            position = ctx.positions[symbol];
            if (row.last <= position.cutLossTarget) {
                exitList.push(symbol);
                continue;
            }
        }

        // Close the position for existing symbol
        for (var i=0;i< exitList.length; i++) {
            symbol = exitList[i];
            ctx.setPositionPercent(symbol, 0);
        }

        // Adjust the stop loss price using trailing stop
        for (symbol in ctx.positions) {
            row = ctx.screened().row(symbol);
            position = ctx.positions[symbol];
            var gapPercent = (row.last - position.cutLossTarget) / row.last;
            if (gapPercent > cutLossPercent) {
                position.cutLossTarget = row.last - (row.last * cutLossPercent);
            }
        }

        // if the portfolio is empty, or less than the expected number of stocks
        // buy some more using the screening result (if there's some in the screening result)
        var morePosition = ctx.targetPositions - ctx.positionCount();
        if (morePosition > 0) {
            var buySignal = ctx.screened().filter(function (row) {
                return (row.trade_signal === true);
            });
            buySignal.sortBy('slope');
            var topSymbols = buySignal.top(morePosition).index();
            for (var i=0; i<topSymbols.length; i++) {
                ctx.setPositionPercent(topSymbols[i], percentPositionSize);
            }
        }
    });

module.exports = {
    screener: scr1,
    tradingActions: actions1
};