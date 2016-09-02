const express = require('express');
const router = express.Router();
const PluginManager = require('../../plugins/PluginManager');
const portManager = PluginManager.getPlugin('portfolio');

router.route('/transactions')

    .get((req, res) => {
        portManager.getAllTransactions()
            .then((results) => {
                res.json({success: true, transactions: results});
            })
            .catch((ex) => {
                res.json({success: false, exception: ex});
            });
    })

    .post((req, res) => {
        var tx = req.body;
        portManager.addTransaction(tx)
            .then(() => {
                res.json({success: true});
            })
            .catch((ex) => {
                res.json({success: false, exception: ex});
            });
    });

router.route('/transactions/:id')

    .get((req, res) => {
        res.json({success: true, transaction: {}});
    })

    .put((req, res) => {

    })

    .delete((req, res) => {

    });

module.exports = router;