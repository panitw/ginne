const mongoose = require('mongoose');

const positionSchema = mongoose.Schema({
	symbol: String,
	shares: Number,
	cost: Number
});

positionSchema.virtual('averagePrice').get(function () {
	return this.cost / this.shares;
});

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;