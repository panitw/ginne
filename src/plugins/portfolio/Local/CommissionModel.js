'use strict';

const mongoose = require('mongoose');

const commissionModelSchema = mongoose.Schema({
    percent: Number,
    minimumPerDay: Number,
    vat: Number,
    activeDate: Date
});

commissionModelSchema.statics.getActiveModel = function (atDate) {
	if (!atDate) {
		return this.findOne({}).sort({'activeDate': -1});
	} else {
		return this.findOne({activeDate: {$lte: atDate}}).sort({'activeDate': -1});
	}
};

const CommissionModel = mongoose.model('CommissionModel', commissionModelSchema);

module.exports = CommissionModel;