'use strict';

const express = require('express');
const Recommendation = require('../../execution/Recommendation');

let router = express.Router();

router.get('/recommendations', function(req, res) {
	Recommendation.getLastest()
		.then((recommendation) => {
			if (recommendation) {
				res.json({success: true, recommendations: recommendation});
			} else {
				res.json({success: true, recommendations: null});
			}
		})
		.catch((ex) => {
			res.json({success: false, exception: ex});
		});
});

module.exports = router;