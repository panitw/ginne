'use strict';

const fin = require('fin-data');

class Context {

    constructor (options) {
        this._initialAsset = options.initialAsset;
        this._startDate = options.start;
        this._endDate = options.end;
        this._universe = null;
        this._analyzedData = {};
        this._equityGraph = new fin.DataFrame();
        this._transactions = [];
    }

    startDate() {
        return this._startDate;
    }

    endDate() {
        return this._endDate;
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

    equityGraph() {
        return this._equityGraph;
    }

    transactions () {
        return this._transactions;
    }

    setPositionPercent (symbol, percent) {

    }
}

module.exports = Context;