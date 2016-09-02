const mongoose = require('mongoose');

const positionSchema = mongoose.Schema({
	symbol: String,
	shares: Number,
	cost: Number,
	averagePrice: Number
});

const Position = mongoose.model('Position', positionSchema);

module.exports = Position;