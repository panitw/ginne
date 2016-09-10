'use strict';

const fin = require('fin-data');
const Position = require('./Position');
const moment = require('moment');

class Context {

	constructor (options) {
		this._asset = options.initialAsset;
		this._startDate = options.start;
		this._endDate = options.end;
		this._targetPositions = options.targetPositions;
		this._slippagePercent = options.slippagePercent;
		this._commissionPercent = options.tradeCommission;
		this._minDailyCommission = options.minDailyCommission;
		this._cutLossPercent = options.cutLossPercent;
		this._vat = options.vat;
		this._universe = null;
		this._latestData = null;
		this._analyzedData = {};
		this._equityCurve = new fin.DataFrame();
		this._transactions = [];
		this._positions = {};
		this._currentDateTradeSize = 0;
		this._currentDateCommission = 0;
	}

	asset () {
		return this._asset;
	}

	startDate () {
		return this._startDate;
	}

	endDate () {
		return this._endDate;
	}

	setEndDate (endDate) {
		this._endDate = endDate;
	}

	currentDate () {
		return this._currentDate;
	}

	setCurrentDate (date) {
		this._currentDate = date;
	}

	cutLossPercent () {
		return this._cutLossPercent;
	}

	positions () {
		return this._positions;
	}

	setPositions (positions) {
		this._positions = positions;
	}

	targetPositions () {
		return this._targetPositions;
	}

	positionCount () {
		return Object.keys(this._positions).length;
	}

	universe () {
		return this._universe;
	}

	setUniverse (universe) {
		this._universe = universe;
	}

	analyzedData (symbol, opt_date) {
		if (!opt_date) {
			return this._analyzedData[symbol];
		} else {
			if (this._analyzedData[symbol]) {
				return this._analyzedData[symbol].row(opt_date);
			} else {
				return null;
			}
		}
	}

	setAnalyzedData (symbol, dataFrame) {
		this._analyzedData[symbol] = dataFrame;
	}

	latestData () {
		return this._latestData;
	}

	setLatestData (data) {
		this._latestData = data;
	}

	equityCurve () {
		return this._equityCurve;
	}

	transactions () {
		return this._transactions;
	}

	endOfDayProcessing () {
		if (this._currentDateTradeSize > 0) {
			let minCommission = this._minDailyCommission + (this._minDailyCommission * this._vat);
			if (this._currentDateCommission < minCommission) {
				let gap = minCommission- this._currentDateCommission;
				this._asset -= gap;
				this._currentDateCommission = minCommission;
			}
			this._addCommissionTransaction(this.currentDate(), this._currentDateCommission);
		}
		this._equityCurve.setRow(this.currentDate(), {
			equity: this.portfolioSize()
		});
		this._currentDateTradeSize = 0;
		this._currentDateCommission = 0;
	}

	portfolioSize () {
		let sum = 0;
		for (let symbol in this._positions) {
			let position = this._positions[symbol];
			//Use end of day price to calculate the portfolio size of the day
			let lastPrice = this._latestData.value('close', symbol);
			if (!isNaN(lastPrice)) {
				sum += (lastPrice * position.number());
			} else {
				//Loop back in time to find data
				let analyzedData = this.analyzedData(symbol);
				let runner = moment(this.currentDate()).add(-1, 'day').toDate();
				while (runner >= this.startDate()) {
					let row = analyzedData.row(runner);
					if (row && !isNaN(row.close)) {
						lastPrice = row.close;
						break;
					}
					runner = moment(runner).add(-1, 'day').toDate();
				}
				if (!isNaN(lastPrice)) {
					sum += (lastPrice * position.number());
				} else {
					throw new Error('No last price to calculate portfolio size for symbol ' + symbol);
				}
			}
		}
		return this._asset + sum;
	}

	closeAllPositions () {
		for (let symbol in this._positions) {
			this.setPositionPercent(symbol, 0);
		}
	}

	canTrade (symbol) {
		let symbolPrice = this._latestData.value('open', symbol);
		return !isNaN(symbolPrice);
	}

	setPositionPercent (symbol, percent) {
		if (!this._positions[symbol]) {
			this._positions[symbol] = new Position(0, 0);
		}
		let portSize = this.portfolioSize();

		//Buy at the open price of the day
		let symbolPrice = this._latestData.value('open', symbol);

		if (!isNaN(symbolPrice)) {
			let position = this._positions[symbol];
			let currentPositionSize = symbolPrice * position.number();
			let targetSymbolPositionSize = portSize * percent;
			let gapToFill = targetSymbolPositionSize - currentPositionSize;
			if (gapToFill > 0) {
				let buyPrice = symbolPrice + (symbolPrice * this._slippagePercent);
				let commissionPerShare = (buyPrice * this._commissionPercent);
				let commissionVat = commissionPerShare * this._vat;
				let totalCommissionPerShare = commissionPerShare + commissionVat;
				let buyPriceWithCommission = buyPrice + totalCommissionPerShare;
				let buyPosition = Math.floor(gapToFill / buyPriceWithCommission);
				let totalCommission = buyPosition * totalCommissionPerShare;
				this._asset -= totalCommission;
				this._currentDateCommission += totalCommission;

				this._buy(symbol, buyPosition, buyPrice);
			} else
			if (gapToFill < 0) {
				let sellPrice = symbolPrice - (symbolPrice * this._slippagePercent);
				let sellPosition = Math.floor((-1 * gapToFill) / sellPrice);
				if (sellPosition > position.number()) {
					sellPosition = position.number();
				}
				let commission = (sellPrice * sellPosition) * this._commissionPercent;
				let commissionVat = commission * this._vat;
				let totalCommission = commission + commissionVat;
				this._asset -= totalCommission;
				this._currentDateCommission += totalCommission;

				this._sell(symbol, sellPosition, sellPrice);
			}
		} else {
			throw new Error('No last price to calculate portfolio size for symbol ' + symbol);
		}
	}

	_addTransaction (type, date, symbol, number, price) {
		this._transactions.push({
			type: type,
			date: date,
			symbol: symbol,
			number: number,
			price: price
		});
		console.log(date, type, symbol, number, price, '[' + this.portfolioSize() + ']');
	}

	_addCommissionTransaction (date, cost) {
		this._transactions.push({
			type: 'C',
			date: date,
			cost: cost
		});
		console.log(date, 'C', cost);
	}

	_buy (symbol, number, atPrice) {
		if (!this._positions[symbol]) {
			this._positions[symbol] = new Position(0, 0);
		}
		let position = this._positions[symbol];
		let tradeSize = number * atPrice;

		//Set position number
		position.add(number, atPrice);

		//Set initial cut-loss target
		position.setCutLossTarget(atPrice - (atPrice * this._cutLossPercent));

		//Adjust asset in hand
		this._asset -= tradeSize;

		//Record trade size for commission calculation
		this._currentDateTradeSize += tradeSize;

		//Log transaction
		this._addTransaction('B', this._currentDate, symbol, number, atPrice);
	}

	_sell (symbol, number, atPrice) {
		if (!this._positions[symbol]) {
			throw new Error('No position to sell for ' + symbol);
		}
		let position = this._positions[symbol];
		let tradeSize = number * atPrice;

		//Throw error if there's no position to sell
		if (position.number() < number) {
			throw new Error('There \'s no position to be sold for ' + symbol);
		}

		//Set position number
		position.remove(number);

		//Adjust asset in hand
		this._asset += tradeSize;

		//Record trade size for commission calculation
		this._currentDateTradeSize += tradeSize;

		//If there's no more position, remove it from the position list
		if (position.number() === 0) {
			delete this._positions[symbol];
		}

		//Log transaction
		this._addTransaction('S', this._currentDate, symbol, number, atPrice);
	}

}

module.exports = Context;