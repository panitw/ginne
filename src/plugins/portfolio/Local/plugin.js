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
			return CommissionModel.getActiveModel()
				.then((model) => {
					commissionModel = model;
					if (commissionModel) {
						let totalPrice = txInfo.price * txInfo.amount;
						let comm = totalPrice * commissionModel.percent;
						let vat = comm * commissionModel.vat;
						txInfo.commission = {
							commission: comm,
							vat: vat
						};
						tx = new Transaction(txInfo);
						return tx.save();
					} else {
						throw new Error('No commission model');
					}
				})
				.then(() => {
					return Position.findOne({symbol: tx.symbol}).exec();
				})
				.then((position) => {
					if (position) {
						if (tx.type === 'buy') {
							position.cost = position.cost + tx.totalCost();
							position.shares = position.shares + tx.amount;
							return position.save();
						} else {
							if (position.shares > tx.amount) {
								let percentSharesRemain = (position.shares - tx.amount) / position.shares;
								position.cost = position.cost * percentSharesRemain;
								position.shares = position.shares - tx.amount;
								return position.save();
							} else
							if (position.shares === tx.amount) {
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
						} else {
							throw new Error('Unable to sell the stock that you do not have');
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