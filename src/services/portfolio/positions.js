const express = require('express');

let router = express.Router();

router.get('/positions', function(req, res) {
    res.json({success: true, positions: []});
});

module.exports = router;