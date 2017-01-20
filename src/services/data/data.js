'use strict';

const express = require('express');
const moment = require('moment');
const reader = require('set-data-reader');

let router = express.Router();

// Get last data point
router.get('/last', function(req, res) {
	reader.read()
		.then((setData) => {
			var output = [];
			for (let i=0; i<setData.length; i++) {
				let item = setData[i];				
				var row = [
					item.symbol,
					moment.utc(item.date).format('DD-MM-YYYY'),
					item.open,
					item.high,
					item.low,
					item.close,
					item.volume
				];
				output.push(row.join(','));
			}
			res.send(output.join('\n'));			
		});
});

module.exports = router;