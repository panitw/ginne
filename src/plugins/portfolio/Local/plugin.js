'use strict';

const mongoose = require('mongoose');
const Transaction = require('./Transaction');
const Position = require('./Position');

class LocalPortfolioManager {

    constructor (config) {
        this._config = config;
        this._txTypes = ['buy', 'sell', 'deposit', 'withdraw', 'commission'];
    }

    init () {
        mongoose.connect(this._config.connectionString);
    }

    addTransaction (txInfo) {
        let tx = new Transaction(txInfo);
        return tx.save();
    }

    updateTransaction (id, txInfo) {
        return Transaction.update({ _id: id }, { $set: txInfo});
    }

    deleteTransaction (id) {
        return Transaction.remove({ _id: id });
    }

    getAllTransactions () {
        return Transaction.find({}).sort({date: -1}).exec();
    }

    getPositions () {
        return Position.find().sort({symbol: 1}).exec();
    }
}

module.exports = LocalPortfolioManager;