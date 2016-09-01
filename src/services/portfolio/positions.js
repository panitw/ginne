var express = require('express');
var router = express.Router();

router.get('/positions', function(req, res) {
    res.json({success: true, positions: []});
});

module.exports = router;