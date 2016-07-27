// -------------------
// Phase 1 - Screening
// -------------------
var scr1 = new Screener();
scr1.universe('.SETI')
    .addAnalysis('slope', {
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
        if (slope_prev <= 0 && slope > 0) {
            return true;
        } else 
        if (slope_prev > 0 && slope > 0) {
            return true;
        } else {
            return false;
        }
    });

// --------------------------
// Phase 2 - Trading Actions
// --------------------------

var actions1 = new TradeActions();
actions1
    .on('dailyOpenAndClose', function (e, ctx) {
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

// --------------------------
// Phase 3 - Back Testing
// --------------------------

var tester = new BackTester();
var testResult = tester.run({
   initialAsset: 30000,
   targetPositions: 2,
   start: '2015-01-01',
   end: '2016-07-26',
   bar: 'daily',
   tradeCommission: {
       minimum: 50,
       percent: 0.1578
   },
   strategy: {
     screener: scr1,
     tradeActions: actions1
   }
});

// --------------------------
// Phase 4 - Result Analysis
// --------------------------

var result = {
    finalAsset: 50000, 
    totalReturn: 20000,
    totalReturnPercent: 66.67,
    sharpe: 1.35,
    maxDrawndownPercent: 10,
    transactionDetails: [],
    assetHistory: []
};