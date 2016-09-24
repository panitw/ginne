'use strict';

const express = require('express');
const Plugin = require('../../plugins/PluginManager');
const strategy = Plugin.getPlugin('strategy');

let router = express.Router();

// List all strategy
router.get('/list', function(req, res) {
	strategy.getStrategyList()
		.then((list) => {
			res.json({success: true, list: list});
		})
		.catch((ex) => {
			res.json({success: false, exception: ex});
		});
});

// Create strategy
router.post('/', function (req, res) {
	let content = req.body;
	if (!content || !content.name || !content.code) {
		res.json({success: false, exception: 'Invalid parameters'});
	} else {
		strategy.createStrategy(content.name, content.code)
			.then((newId) => {
				res.json({success: true, id: newId});
			})
			.catch((err) => {
				res.json({success: false, exception: err.message});
			});
	}
});

// Get strategy code
router.get('/:id', function (req, res) {
	let id = req.params.id;
	strategy.getStrategyCode(id)
		.then((code) => {
			res.json({success: true, code: code});
		})
		.catch((err) => {
			res.json({success: false, exception: err.message});
		});
});

// Update strategy
router.put('/:id', function (req, res) {
	let id = req.params.id;
	let str = req.body;
	let newName = str.name;
	let newCode = str.code;
	if (!newName) {
		res.json({success: false, exception: 'Invalid parameters'});
	} else {
		strategy.updateStrategy(id, newName, newCode)
			.then(() => {
				res.json({success: true});
			})
			.catch((err) => {
				res.json({success: false, exception: err.message});
			});
	}
});

// Delete strategy
router.delete('/:id', function (req, res) {
	let id = req.params.id;
	strategy.deleteStrategy(id)
		.then(() => {
			res.json({success: true});
		})
		.catch((err) => {
			res.json({success: false, exception: err.message});
		});
});

// Set master id
router.put('/master/:id', function (req, res) {
	let id = req.params.id;
	strategy.setMasterStrategy(id)
		.then(() => {
			res.json({success: true});
		})
		.catch((err) => {
			res.json({success: false, exception: err.message});
		});
});

module.exports = router;