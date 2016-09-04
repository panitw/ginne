'use strict';

const mongoose = require('mongoose');
const CommissionModel = require('./CommissionModel');
const Transaction = require('./Transaction');

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
			let currentPosition = 0;
			return Transaction.getAllTransactionsOf(txInfo.symbol, true)
				.then((allSymbolTx) => {
					for (let i=0; i<allSymbolTx.length; i++) {
						let tx = allSymbolTx[i];
						if (tx.type === 'buy') {
							currentPosition += tx.amount;
						} else
						if (tx.type === 'sell') {
							currentPosition -= tx.amount;
						}
					}
					return CommissionModel.getActiveModel();
				})
				.then((model) => {
					commissionModel = model;
					if (!commissionModel) {
						throw new Error('No commission model defined');
					} else
					if (currentPosition === 0) {
						if (txInfo.type === 'sell') {
							throw new Error('Unable to sell ' + txInfo.symbol + ' with no position');
						}
					} else
					if (txInfo.type === 'sell' && currentPosition < txInfo.amount) {
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
		let equity = 0;
		let positions = {};
		return Transaction.find({}).sort({date: 1}).exec()
			.then((txs) => {
				for (var i=0; i<txs.length; i++) {
					var tx = txs[i];
					if (tx.symbol && tx.symbol !== '') {
						if (!positions[tx.symbol]) {
							positions[tx.symbol] = {
								symbol: tx.symbol,
								shares: 0,
								cost: 0
							};
						}
					}

					var pos = positions[tx.symbol];
					if (tx.type === 'buy') {
						pos.shares += tx.amount;
						pos.cost += tx.totalCost();
						equity -= tx.totalCost();
					}
					if (tx.type === 'sell') {
						pos.cost *= (pos.shares - tx.amount) / pos.shares;
						pos.shares -= tx.amount;
						equity += (tx.amount * tx.price) - tx.totalCommission();
					}
					if (tx.type === 'withdraw') {
						equity -= tx.amount;
					}
					if (tx.type === 'deposit') {
						equity += tx.amount;
					}
				}
				let output = [];
				for (let symbol in positions) {
					if (positions[symbol].shares > 0) {
						output.push(positions[symbol]);
					}
				}
				output.sort(function (a, b) {
					return a.symbol.localeCompare(b.symbol);
				});
				return {
					equity: equity,
					positions: output
				};
			});
	}
}

module.exports = LocalPortfolioManager;