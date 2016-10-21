'use strict';

const express = require('express');
const PluginManager = require('../../plugins/PluginManager');
const portManager = PluginManager.getPlugin('portfolio');
const source = PluginManager.getPlugin('source');

let router = express.Router();

router.get('/positions', function(req, res) {
	portManager.getPositions()
		.then((results) => {
			let allPromises = [];
			for (var i=0; i<results.positions.length; i++) {
				var promise = source.getLastData(results.positions[i].symbol)
					.then(function (result, lastData) {
						if (lastData) {
							result.last = lastData.c;
						}
					}.bind(this, results.positions[i]));
				allPromises.push(promise);
			}
			Promise.all(allPromises).then(() => {
				res.json({success: true, positions: results});
			});
		})
		.catch((ex) => {
			res.json({success: false, exception: ex});
		});
});

module.exports = router;