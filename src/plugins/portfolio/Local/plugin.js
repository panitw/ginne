'use strict';

const mongoose = require('mongoose');
const Transaction = require('./Transaction');
const Position = require('./Position');

class LocalPortfolioManager {

    constructor (config) {
        this._config = config;
    }

    init () {
        mongoose.connect(this._config.connectionString);
    }

    addTransaction (txInfo) {
        let tx = new Transaction(txInfo);
        return tx.save();
    }

    editTransaction (id, txInfo) {
        return Transaction.update({ _id: id }, { $set: txInfo});
    }

    getTransactions (startDate, endDate) {
        return Transaction.find({date: {$gte: startDate, $lt: endDate}}).sort({date: -1}).exec();
    }

    getPositions () {
        return Position.find().sort({symbol: 1}).exec();
    }
}

module.exports = LocalPortfolioManager;