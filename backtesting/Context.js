'use strict';

const fin = require('fin-data');

class Context {

    constructor (options) {
        this._initialAsset = options.initialAsset;
        this._currentDate = null;
        this._screened = new fin.DataFrame();
        this._equityGraph = new fin.DataFrame();
        this._transactions = [];
    }

    currentDate() {
        return this._currentDate;
    }

    setCurrentDate (date) {
        this._currentDate = date;
    }

    screened() {
        this._screened;
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