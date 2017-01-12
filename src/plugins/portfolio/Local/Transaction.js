'use strict';

const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
	type: String,
	date: Date,
	symbol: String,
	amount: Number,
	price: Number,
	commission: {
		commission: Number,
		vat: Number
	}
}, {timestamps: true});

transactionSchema.statics.getAllTransactionsOf = function (symbol, sortDescending) {
	let sortDir = 1;
	if (sortDescending) {
		sortDir = -1;
	}
	return this.find({symbol: symbol}).sort({date: sortDir}).exec();
};

transactionSchema.statics.getTransactionsBetween = function (fromDate, toDate, sortDescending) {
	let sortDir = 1;
	if (sortDescending) {
		sortDir = -1;
	}
	return this.find({date: {$gte: fromDate, $lt: toDate}}).sort({date: sortDir}).exec();
};

transactionSchema.methods.totalCost = function () {
	if (this.type === 'buy' || this.type === 'sell') {
		return (this.amount * this.price);
	} else {
		return this.amount;
	}
};

transactionSchema.methods.totalCommission = function () {
	return (this.commission.commission + this.commission.vat);
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;