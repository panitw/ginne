'use strict';

var mongoose = require('mongoose');

class LocalPortfolioManager {

    constructor (config) {
        this._config = config;
    }

    init () {
        mongoose.connect(this._config.connectionString);
    }

    addTransaction () {

    }

    editTransaction () {

    }

    getTransactions (startDate, endDate) {

    }

    getPositions () {

    }
}

module.exports = LocalPortfolioManager;