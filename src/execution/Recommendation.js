'use strict';

const mongoose = require('mongoose');

const aRecommendationSchema = mongoose.Schema({
	type: String,
	symbol: String,
	price: Number,
	amount: Number
});

const recommendationSchema = mongoose.Schema({
	date: Date,
	recommendations: [aRecommendationSchema]
});

recommendationSchema.statics.getLastest = function () {
	return this.findOne({}).sort({date: -1});
};

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

module.exports = Recommendation;