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

transactionSchema.methods.totalCost = function () {
	if (this.type === 'buy' || this.type === 'sell') {
		return (this.amount * this.price) + (this.commission.commission + this.commission.vat);
	} else {
		return this.amount;
	}
};

transactionSchema.methods.averagePrice = function () {
	if (this.type === 'buy' || this.type === 'sell') {
		return this.totalCost() / this.amount;
	} else {
		return this.amount;
	}
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;