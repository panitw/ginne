'use strict';

const mongoose = require('mongoose');
const moment = require('moment');
const CommissionModel = require('./CommissionModel');
const Transaction = require('./Transaction');

class LocalPortfolioManager {

	constructor (config) {
		this._config = config;
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
				})
				.then(() => {
					return this._calculateCommission(txInfo.date);
				});
		} else {
			let tx = new Transaction(txInfo);
			return tx.save();
		}
	}

	updateTransaction (id, txInfo) {
		return Transaction.update({ _id: id }, { $set: txInfo})
			.then(() => {
				return this._calculateCommission(txInfo.date);
			});
	}

	deleteTransaction (id) {
		let txToBeDeleted = null;
		return Transaction.findOne({ _id: id })
			.exec()
			.then((txInfo) => {
				if (txInfo) {
					txToBeDeleted = txInfo;
					return txInfo.remove();
				}
			})
			.then(() => {
				if (txToBeDeleted) {
					return this._calculateCommission(txToBeDeleted.date);
				}
			});
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
						positions[symbol].price = positions[symbol].cost / positions[symbol].shares;
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

	getCommissionModel (ofDate) {
		return CommissionModel.getActiveModel(ofDate);
	}

	_calculateCommission (ofDate) {
		let startDate = moment.utc(ofDate).startOf('day').toDate();
		let endDate = moment.utc(startDate).add(1, 'day').toDate();
		let commissionModel = null;
		CommissionModel.getActiveModel(ofDate)
			.then((model) => {
				if (!model) {
					throw new Error('No commission model on ' + ofDate);
				} else {
					commissionModel = model;
					return Transaction.getTransactionsBetween(startDate, endDate);
				}
			})
			.then((txs) => {
				let allPromises = [];
				let totalCommission = 0;
				let commTx = null;
				for (let i=0; i<txs.length; i++) {
					let tx = txs[i];
					if (tx.type === 'buy' || tx.type === 'sell') {
						let totalPrice = tx.price * tx.amount;
						let comm = totalPrice * commissionModel.percent;
						let vat = comm * commissionModel.vat;
						tx.commission = {
							commission: comm,
							vat: vat
						};
						totalCommission += comm;
						allPromises.push(tx.save());
					} else
					if (tx.type === 'commission') {
						commTx = tx;
					}
				}
				if (totalCommission < commissionModel.minimumPerDay) {
					var remainingComm = commissionModel.minimumPerDay - totalCommission;
					var remainingVat = remainingComm * commissionModel.vat;
					if (!commTx) {
						commTx = new Transaction({
							type: 'commission',
							date: startDate,
							commission: {
								commission: remainingComm,
								vat: remainingVat
							}
						});
					} else {
						commTx.commission = {
							commission: remainingComm,
							vat: remainingVat
						};
					}
					allPromises.push(commTx.save());
				} else {
					if (commTx) {
						allPromises.push(commTx.remove());
					}
				}
				return Promise.all(allPromises);
			});
	}
}

module.exports = LocalPortfolioManager;