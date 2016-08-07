'use strict';

const fin = require('fin-data');
const Position = require('./Position');

class Context {

    constructor (options) {
        this._asset = options.initialAsset;
        this._startDate = options.start;
        this._endDate = options.end;
        this._targetPositions = options.targetPositions;
        this._slippagePercent = options.slippagePercent;
        this._universe = null;
        this._latestData = null;
        this._analyzedData = {};
        this._equityGraph = new fin.DataFrame();
        this._transactions = [];
        this._positions = {};
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

    currentDate () {
        return this._currentDate;
    }

    setCurrentDate (date) {
        this._currentDate = date;
    }

    positions () {
        return this._positions;
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

    equityGraph () {
        return this._equityGraph;
    }

    transactions () {
        return this._transactions;
    }

    addTransaction (type, date, symbol, number, price) {
        this._transactions.push({
            type: type,
            date: date,
            symbol: symbol,
            number: number,
            price: price
        });
        console.log(date, type, number, price);
    }

    portfolioSize () {
        let sum = 0;
        for (let symbol in this._positions) {
            let position = this._positions[symbol];
            let lastPrice = this._latestData.value('close', symbol);
            if (!isNaN(lastPrice)) {
                sum += (lastPrice * position.number());
            } else {
                throw new Error('No last price to calculate portfolio size for symbol ' + symbol);
            }
        }
        return this._asset + sum;
    }

    buy (symbol, number, atPrice) {
        if (!this._positions[symbol]) {
            this._positions[symbol] = new Position(0);
        }
        //Set position number
        let position = this._positions[symbol];
        position.setNumber(position.number() + number);

        //Adjust asset in hand
        this._asset -= number * atPrice;

        //Log transaction
        this.addTransaction('B', this._currentDate, symbol, number, atPrice);
    }

    sell (symbol, number, atPrice) {
        if (!this._positions[symbol]) {
            throw new Error('No position to sell for ' + symbol);
        }
        let position = this._positions[symbol];

        //Throw error if there's no position to sell
        if (position.number() < number) {
            throw new Error('There \'s no position to be sold for ' + symbol);
        }

        //Set position number
        position.setNumber(position.number() - number);

        //Adjust asset in hand
        this._asset += number * atPrice;

        //If there's no more position, remove it from the position list
        if (position.number() === 0) {
            delete this._positions[symbol];
        }

        //Log transaction
        this.addTransaction('S', this._currentDate, symbol, number, atPrice);
    }

    closeAllPositions () {
        for (let symbol in this._positions) {
            this.setPositionPercent(symbol, 0);
        }
    }

    setPositionPercent (symbol, percent) {
        if (!this._positions[symbol]) {
            this._positions[symbol] = new Position(0);
        }
        let portSize = this.portfolioSize();
        let symbolLast = parseFloat(this._latestData.value('close', symbol));
        if (!isNaN(symbolLast)) {
            let position = this._positions[symbol];
            let currentPositionSize = symbolLast * position.number();
            let targetSymbolPositionSize = portSize * percent;
            let gapToFill = targetSymbolPositionSize - currentPositionSize;
            if (gapToFill > 0) {
                let buyPrice = symbolLast + (symbolLast * this._slippagePercent);
                let buyPosition = Math.floor(gapToFill / buyPrice);
                this.buy(symbol, buyPosition, buyPrice);
            } else
            if (gapToFill < 0) {
                let sellPrice = symbolLast - (symbolLast * this._slippagePercent);
                let sellPosition = Math.floor((-1 * gapToFill) / sellPrice);
                if (sellPosition > position.number()) {
                    sellPosition = position.number();
                }
                this.sell(symbol, sellPosition, sellPrice);
            }
        } else {
            throw new Error('No last price to calculate portfolio size for symbol ' + symbol);
        }
    }
}

module.exports = Context;