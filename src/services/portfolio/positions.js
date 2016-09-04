const express = require('express');
const PluginManager = require('../../plugins/PluginManager');
const portManager = PluginManager.getPlugin('portfolio');

let router = express.Router();

router.get('/positions', function(req, res) {
	portManager.getPositions()
		.then((results) => {
			res.json({success: true, positions: results});
		})
		.catch((ex) => {
			res.json({success: false, exception: ex});
		});
});

module.exports = router;