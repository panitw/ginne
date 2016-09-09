'use strict';

const TradeExecutor = require('./TradeExecutor');
const PluginManager = require('../plugins/PluginManager');
const Context = require('./Context');
const moment = require('moment');

class BackTester extends TradeExecutor {

    constructor (dataProvider) {
        this._dataProvider = dataProvider;
    }

    run (strategy, options) {
        let ctx = new Context(options);
        let screener = strategy.screener;
        let universeName = screener.universe();
        let tradingActions = strategy.tradingActions;
        
        let universePlugin = PluginManager.getPlugin('universe');
        let universe = universePlugin.getUniverse(universeName);

        ctx.setUniverse(universe);

        return this.processScreener(ctx, screener)
            .then(() => {
                return this.processTradingActions(ctx, tradingActions);
            })
            .then(() => {
	            ctx.closeAllPositions();
	            result = {
		            initialCapital: options.initialAsset,
		            endCapital: ctx.asset(),
		            netProfit: ctx.asset() - options.initialAsset,
		            percentNetProfit: ((ctx.asset() - options.initialAsset) / options.initialAsset) * 100,
		            //equityCurve: ctx.equityCurve(),
		            maximumDrawdown: ctx.equityCurve().maximumDrawdown('equity') * 100
	            };

	            //Compound Average Growth Return
	            let totalDays = moment(ctx.endDate()).diff(ctx.startDate(), 'days');
	            let totalYears = Math.round(totalDays / 365);
	            result.CAGRPercent = (Math.pow((result.endCapital / result.initialCapital), 1 / totalYears) - 1) * 100;

	            //Drawdown Duration
	            let ddDuration = ctx.equityCurve().drawdownDuration('equity');
	            let startIndex = ctx.equityCurve().indexAtLoc(ddDuration.startIndex);
	            let endIndex = ctx.equityCurve().indexAtLoc(ddDuration.endIndex);
	            let drawdownDays = moment(endIndex).diff(startIndex, 'days');
	            result.drawdownDuration = drawdownDays;

	            return result;
            });
    }

}

module.exports = BackTester;