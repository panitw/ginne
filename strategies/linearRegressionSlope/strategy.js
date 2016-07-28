const Screener = require('../../pipeline/Screener');
const TradingActions = require('../../pipeline/TradingActions');

// -------------------
//     Screening
// -------------------

var scr1 = new Screener('SET');
src1.addAnalysis('slope', {
        type: 'LINEARREG_SLOPE',
        period: 5,
        field: 'last'
    })
    .addAnalysis('slope_prev', {
        type: 'LINEARREG_SLOPE',
        period: 5,
        field: 'last',
        offset: -1
    })
    .mask('trend_signal', function (row) {
        if (row.slope_prev <= 0 && row.slope > 0) {
            return true;
        } else 
        if (row.slope_prev > 0 && row.slope > 0) {
            return true;
        } else {
            return false;
        }
    });

// --------------------------
//      Trading Actions
// --------------------------

var actions1 = new TradeActions();
actions1
    .on('dailyOpenAndClose', function (ctx) {
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
            row = ctx.screener.row(symbol);
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
            row = ctx.screener.row(symbol);
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
            var buySignal = ctx.screener.filter(function (row) {
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