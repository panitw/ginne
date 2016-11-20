'use strict';

const Analyzer = require('../pipeline/Analyzer');
const TradingActions = require('../pipeline/TradingActions');
const TradeExecutor = require('./TradeExecutor');
const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const moment = require('moment');

class BackTester extends TradeExecutor {

    constructor (dataProvider) {
    	super(dataProvider);
    }

    run (strategy, options) {
        let ctx = new Context(options);
	    let analyzer = new Analyzer();
	    let tradingActions = new TradingActions();

	    ctx.on('transactionAdded', this._newTransactionHandler.bind(this));

	    strategy.analyze(analyzer);
	    strategy.execute(tradingActions);

        let universeName = analyzer.universe();
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);

        ctx.setUniverse(universe);

        return this.processScreener(ctx, analyzer)
            .then(() => {
                return this.processTradingActions(ctx, tradingActions);
            })
            .then(() => {
	            ctx.closeAllPositions();
	            let result = {
		            initialCapital: options.initialAsset,
		            endCapital: ctx.asset(),
		            netProfit: ctx.asset() - options.initialAsset,
		            percentNetProfit: ((ctx.asset() - options.initialAsset) / options.initialAsset) * 100,
		            equityCurve: ctx.equityCurve().toArray(),
		            maximumDrawdown: ctx.equityCurve().maximumDrawdown('equity') * 100,
		            transactions: ctx.transactions()
	            };

	            //Compound Average Growth Return
	            let totalDays = moment(ctx.endDate()).diff(ctx.startDate(), 'days');
	            let totalYears = Math.round(totalDays / 365);
	            result.CAGRPercent = (Math.pow((result.endCapital / result.initialCapital), 1 / totalYears) - 1) * 100;

	            //Drawdown Duration
	            let ddDuration = ctx.equityCurve().drawdownDuration('equity');
	            if (ddDuration) {
		            let startIndex = ctx.equityCurve().indexAtLoc(ddDuration.startIndex);
		            let endIndex = ctx.equityCurve().indexAtLoc(ddDuration.endIndex);
		            result.drawdownDuration = moment(endIndex).diff(startIndex, 'days');
	            } else {
		            result.drawdownDuration = 0;
	            }

	            //Winning Percentage
	            let allTx = ctx.transactions();
	            let winCount = 0;
	            let sellCount = 0;
	            let totalWin = 0;
	            let totalLoss = 0;
	            for (let i=0; i<allTx.length; i++) {
	            	if (allTx[i].type === 'S') {
	            		sellCount++;
	            		if (allTx[i].winning) {
							winCount++;
				            totalWin += allTx[i].margin;
			            } else {
				            totalLoss += Math.abs(allTx[i].margin);
			            }
		            }
	            }
	            result.winningPercent = (winCount / sellCount) * 100;
	            result.winLossRatio = totalWin / totalLoss;

	            return result;
            });
    }

	_newTransactionHandler (tx) {
		this.emit('transactionAdded', tx);
	}

}

module.exports = BackTester;