'use strict';

const mongoose = require('mongoose');
const CommissionModel = require('./CommissionModel');
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
		if (txInfo.type === 'buy' || txInfo.type === 'sell') {
			let tx = null;
			let commissionModel = null;
			let currentPosition = null;
			return Position.getCurrentPosition(txInfo.symbol)
				.then((position) => {
					currentPosition = position;
					return CommissionModel.getActiveModel();
				})
				.then((model) => {
					commissionModel = model;
					if (!commissionModel) {
						throw new Error('No commission model defined');
					} else
					if (!currentPosition) {
						if (txInfo.type === 'sell') {
							throw new Error('Unable to sell ' + txInfo.symbol + ' with no position');
						}
					} else
					if (currentPosition && txInfo.type === 'sell' && currentPosition.shares < txInfo.amount) {
						throw new Error('Unable to sell ' + txInfo.amount + ' positions of ' + txInfo.symbol + ', not enough position');
					}
				})
				.then(() => {
					let totalPrice = txInfo.price * txInfo.amount;
					let comm = totalPrice * commissionModel.percent;
					let vat = comm * commissionModel.vat;
					txInfo.commission = {
						commission: comm,
						vat: vat
					};
					tx = new Transaction(txInfo);
					return tx.save();
				})
				.then(() => {
					if (currentPosition) {
						if (tx.type === 'buy') {
							currentPosition.cost = currentPosition.cost + tx.totalCost();
							currentPosition.shares = currentPosition.shares + tx.amount;
							return position.save();
						} else {
							if (currentPosition.shares > tx.amount) {
								let percentSharesRemain = (currentPosition.shares - tx.amount) / currentPosition.shares;
								currentPosition.cost = currentPosition.cost * percentSharesRemain;
								currentPosition.shares = currentPosition.shares - tx.amount;
								return currentPosition.save();
							} else
							if (currentPosition.shares === tx.amount) {
								return position.remove();
							} else {
								throw new Error('Unable to sell more than what you have');
							}
						}
					} else {
						if (tx.type === 'buy') {
							let newPosition = new Position({
								symbol: tx.symbol,
								shares: tx.amount,
								cost: tx.totalCost()
							});
							return newPosition.save();
						}
					}
				});
		} else {
			let tx = new Transaction(txInfo);
			return tx.save();
		}
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