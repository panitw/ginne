const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
	type: String,
	date: Date,
	symbol: String,
	shares: Number,
	price: Number,
	cost: Number,
	commission: Number
});

const Transaction = mongoose.model('Transaction', transactionSchemaTransaction);

module.exports = Transaction;