var express = require('express');
var router = express.Router();

router.get('/transaction', function(req, res) {
    res.json({success: true, transactions: []});
});

router.post('/transaction/create', function(req, res) {
    res.json({success: true});
});

router.post('/transaction/update', function(req, res) {
    res.json({success: true});
});

router.get('/transaction/:id', function(req, res) {
    res.json({success: true});
});

module.exports = router;