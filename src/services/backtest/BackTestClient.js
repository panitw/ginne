'use strict';

const EventEmitter = require('events');
const logger = require('winston');

const STATE_IDLE = 0;
const STATE_PROCESSING = 1;

const CMD_EXECUTE = 'EXECUTE';
const CMD_STOP = 'STOP';

class BackTestClient extends EventEmitter {

	constructor (dataProvider, socket) {
		super();
		this._dataProvider = dataProvider;
		this._socket = socket;
		this._state = STATE_IDLE;

		this._socket.on('message', (cmd) => {
			logger.info('Client: command received');
			this.processCommand(cmd);
		});

		this._socket.on('disconnect', () => {
			logger.info('Client: disconnected')
			this.disconnect();
		});
	}

	setSocket(socket) {
		this._socket = socket;
		logger.info('Client: re-connected');
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

	processCommand (cmd) {
		switch (this._state) {
			case STATE_IDLE:
				if (cmd.type === CMD_EXECUTE) {
					logger.info('Executing Code');
					logger.info(cmd.code);
				}
				break;
			case STATE_PROCESSING:
				if (cmd.type === CMD_STOP) {
					//Stop current processing
				} else
				if (cmd.type === CMD_EXECUTE) {
					this.error('Currently processing, unable to execute new testing');
				}
				break;
		}
	}

	disconnect () {
		this._state = STATE_IDLE;
		this._socket = null;
		this.emit('disconnected');
	}

}

module.exports = BackTestClient;