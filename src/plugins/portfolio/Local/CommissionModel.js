const mongoose = require('mongoose');

const commissionModelSchema = mongoose.Schema({
    percent: Number,
    minimumPerDay: Number,
    vat: Number,
    activeDate: Date
});

commissionModelSchema.statics.getActiveModel = function () {
	return this.find({}).sort({'activeDate': -1}).limit(1).then((models) => {
		if (models && models.length > 0) {
			return models[0];
		}
	});
};

const CommissionModel = mongoose.model('CommissionModel', commissionModelSchema);

module.exports = CommissionModel;