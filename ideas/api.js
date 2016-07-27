// -------------------
// Phase 1 - Screening
// -------------------
var scr1 = new Screener();
scr1.universe('.SETI')
    .filter(function (row) {
        return row['last'] < 50;
    })
    .addAnalysis('vol20', {
        type: 'STDDEV',
        period: 20,
        field: 'last'
    })
    .mask(function (row) {
        return (row['vol20'] >= 0.25) && (row['vol20'] <= 0.5);
    })
    .addAnalysis('trend_slope', {
        type: 'LINEARREG_SLOPE',
        period: 20,
        field: 'last'
    })
    .mask('trend_signal', function (row) {
        return (row['trend_slope'] > 0.3);
    })
    .filter(function (row) {
        return row["trend_signal"] && row["trend_slope"];
    });

// --------------------------
// Phase 2 - Trading Actions
// --------------------------

var actions1 = new TradeActions();
actions1
    .on('dailyOpenAndClose', function (ctx) {
        // Validate all entries if we need to exit any position and exit if need to
        // Exit Criteria:
        //  - exit signal
        //  - cut loss

        // Adjust the stop loss price using trailing stop

        // if the portfolio is empty, or less than the expected number of stocks
        // buy some more using the screening result (if there's some in the screening result)
    });

// --------------------------
// Phase 3 - Back Testing
// --------------------------

var tester = new BackTester();
var testResult = tester.run({
   initialMoney: 30000,
   numberOfStocks: 2,
   start: '2015-01-01',
   end: '2016-07-26',
   frequency: 'daily',
   tradeCommission: {
       minimum: 50,
       percent: 0.1578
   },
   strategy: {
     screning: scr1,
     tradeActions: actions1
   }
});

// --------------------------
// Phase 4 - Result Analysis
// --------------------------

var result = {
    finalMoney: 50000, 
    totalReturn: 20000,
    totalReturnPercent: 66.67,
    sharpe: 1.35,
    maxDrawndownPercent: 10
};