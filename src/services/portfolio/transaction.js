'use strict';

const express = require('express');
const router = express.Router();
const PluginManager = require('../../plugins/PluginManager');
const portManager = PluginManager.getPlugin('portfolio');
const stateManager = PluginManager.getPlugin('state');

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
                if (tx.profitTarget !== undefined) {
                    return stateManager.getState()
                        .then((state) => {
                            if (!state) {
                                state = {};
                            }
                            if (!state[tx.symbol]) {
                                state[tx.symbol] = {};
                            }
                            state[tx.symbol]['PROFIT_TARGET'] = tx.profitTarget;
                            return state;
                        })
                        .then((state) => {
                            return stateManager.setState(state);
                        });
                }
            })
            .then(() => {
                if (tx.cutLoss !== undefined) {
                    return stateManager.getState()
                        .then((state) => {
                            if (!state) {
                                state = {};
                            }
                            if (!state[tx.symbol]) {
                                state[tx.symbol] = {};
                            }
                            state[tx.symbol]['CUTLOSS'] = tx.cutLoss;
                            return state;
                        })
                        .then((state) => {
                            return stateManager.setState(state);
                        });
                }
            })
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
		        if (tx.profitTarget !== undefined) {
			        return stateManager.getState()
				        .then((state) => {
					        if (!state) {
						        state = {};
					        }
					        if (!state[tx.symbol]) {
						        state[tx.symbol] = {};
					        }
					        state[tx.symbol]['PROFIT_TARGET'] = tx.profitTarget;
					        return state;
				        })
				        .then((state) => {
					        return stateManager.setState(state);
				        });
		        }
	        })
	        .then(() => {
		        if (tx.cutLoss !== undefined) {
			        return stateManager.getState()
				        .then((state) => {
					        if (!state) {
						        state = {};
					        }
					        if (!state[tx.symbol]) {
						        state[tx.symbol] = {};
					        }
					        state[tx.symbol]['CUTLOSS'] = tx.cutLoss;
					        return state;
				        })
				        .then((state) => {
					        return stateManager.setState(state);
				        });
		        }
	        })
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