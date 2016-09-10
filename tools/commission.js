'use strict';

const mongoose = require('mongoose');
const CommissionModel = require('../src/plugins/portfolio/Local/CommissionModel');

mongoose.connect('mongodb://localhost/ginne_portfolio');

let model = new CommissionModel({
	percent: 0.001578,
	minimumPerDay: 50,
	vat: 0.07,
	activeDate: new Date('2016-09-02')
});

model.save();