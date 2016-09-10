'use strict';

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
        let tx = req.body;
        portManager.addTransaction(tx)
            .then(() => {
                res.json({success: true});
            })
            .catch((ex) => {
                res.json({success: false, exception: ex.message});
            });
    });

router.route('/transactions/:id')

    .put((req, res) => {
        let tx = req.body;
        portManager.updateTransaction(req.params.id, tx)
            .then(() => {
                res.json({success: true});
            })
            .catch((ex) => {
                res.json({success: false, exception: ex});
            });
    })

    .delete((req, res) => {
        portManager.deleteTransaction(req.params.id)
            .then(() => {
                res.json({success: true});
            })
            .catch((ex) => {
                res.json({success: false, exception: ex});
            });
    });

module.exports = router;