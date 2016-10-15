'use strict';

const EventEmitter = require('events');
const logger = require('winston');
const BackTester = require('../../execution/BackTester');
const vm = require('vm');
const moment = require('moment');
const PluginManager = require('../../plugins/PluginManager');
const portfolio = PluginManager.getPlugin('portfolio');

const STATE_IDLE = 0;
const STATE_PROCESSING = 1;

const CMD_EXECUTE = 'EXECUTE';
const CMD_STOP = 'STOP';
const CMD_QUERY = 'QUERY';
const CMD_UPDATE_DATA = 'UPDATE_DATA';
const CMD_EXECUTE_LATEST = 'EXECUTE_LATEST';

class BackTestClient extends EventEmitter {

	constructor (dataProvider, socket) {
		super();
		this._dataProvider = dataProvider;
		this._state = STATE_IDLE;
		this.setSocket(socket);
	}

	setSocket(socket) {
		logger.info('Client: connected');
		this._socket = socket;
		this._socket.on('message', (cmd, notifier) => {
			logger.info('Client: command received');
			this.processCommand(cmd, notifier);
		});

		this._socket.on('disconnect', () => {
			logger.info('Client: disconnected')
			this.disconnect();
		});
	}

	error (message) {
		if (this._socket) {
			this._socket.emit('message', {
				type: 'error',
				message: message
			});
		}
	}

	notify (message) {
		if (this._socket) {
			this._socket.emit('message', {
				type: 'notification',
				message: message
			});
		}
	}

	notifyComplete (success, result) {
		if (this._socket) {
			if (success) {
				this._socket.emit('message', {
					type: 'completed',
					success: success,
					result: result
				});
			} else {
				this._socket.emit('message', {
					type: 'completed',
					success: success,
					message: result.message + result.stack
				});
			}
		}
	}

	processCommand (cmd, notifier) {
		if (cmd.type == CMD_QUERY) {
			let stateString = '';
			switch (this._state) {
				case STATE_IDLE:
					stateString = "STATE_IDLE";
					break;
				case STATE_PROCESSING:
					stateString = "STATE_PROCESSING";
					break;
			}
			notifier({
				state: stateString
			});
		} else {
			switch (this._state) {
				case STATE_IDLE:
					if (cmd.type === CMD_EXECUTE) {
						try {
							let strategy = this._createStrategyObj(cmd.code);
							let backTester = new BackTester(this._dataProvider);
							backTester.on('transactionAdded', (tx) => {
								if (tx.type === 'C') {
									this.notify('Transaction: "' + tx.type + '" [' + moment(tx.date).format('DD-MM-YYYY') + '] [' + tx.cost + ']');
								} else {
									this.notify('Transaction: "' + tx.type + '" [' + moment(tx.date).format('DD-MM-YYYY') + '] [' +tx.symbol+ '] ' + '[' + tx.number + '] ' + '[' + tx.price + ']');
								}
							});

							backTester.on('analyzingData', (e) => {
								this.notify('Analyzing ' + e.symbol);
							});

							portfolio.getCommissionModel(new Date())
								.then((commModel) => {
									backTester.run(strategy, {
										initialAsset: cmd.initialAsset,
										targetPositions: cmd.targetPositions,
										cutLossPercent: cmd.cutLossPercent,
										start: new Date(cmd.startDate),
										end: new Date(cmd.endDate),
										tradeCommission: commModel.percent,
										vat: commModel.vat,
										minDailyCommission: commModel.minimumPerDay,
										slippagePercent: cmd.slippagePercent
									}).then((result) => {
										this.notifyComplete(true, result);
										this._state = STATE_IDLE;
									}).catch((err) => {
										this.notifyComplete(false, err);
										this.error(err.message);
									});
									this._state = STATE_PROCESSING;
									notifier({
										success: true
									});
								});
						}
						catch (ex) {
							notifier({
								success: false,
								message: ex.message,
								stack: ex.stack
							});
						}
					} else
					if (cmd.type === CMD_UPDATE_DATA) {
						this._state = STATE_PROCESSING;
						let task = require('../../tasks/updateData');
						task.execute()
							.then(() => {
								logger.info('Finish update data from SET');
								this.notifyComplete(true, null);
								this._state = STATE_IDLE;
							})
							.catch((ex) => {
								this.notifyComplete(false, ex.message);
								this.error(ex.message);
							});
						notifier({
							success: true
						});
					}
					break;
				case STATE_PROCESSING:
					if (cmd.type === CMD_STOP) {
						//Stop current processing
						this._state = STATE_IDLE;
						notifier({
							success: true
						});
					} else
					if (cmd.type === CMD_EXECUTE) {
						notifier({
							success: false,
							message: 'Currently processing, unable to execute new testing'
						});
					}
					break;
			}
		}
	}

	disconnect () {
		this._socket = null;
		this.emit('disconnected');
	}

	_createStrategyObj (code) {
		let script = new vm.Script(code);
		let Strategy = script.runInNewContext();
		let strategyObj = new Strategy();
		return strategyObj;
	}


}

module.exports = BackTestClient;