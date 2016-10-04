'use strict';

const EventEmitter = require('events');
const logger = require('winston');

const STATE_IDLE = 0;
const STATE_PROCESSING = 1;

const CMD_EXECUTE = 'EXECUTE';
const CMD_STOP = 'STOP';
const CMD_QUERY = 'QUERY';

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
						logger.info('Executing Code');
						logger.info(cmd.code);
						this._state = STATE_PROCESSING;
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

}

module.exports = BackTestClient;