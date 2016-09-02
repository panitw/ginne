const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
	type: String,
	date: Date,
	symbol: String,
	amount: Number,
	price: Number,
	commission: Number
}, {timestamps: true});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;