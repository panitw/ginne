app.service('executor', function ($rootScope, daemonConnector, codeEditor, logger) {

	var STATE_IDLE = 0;
	var STATE_EXECUTING = 1;

	var currentState = STATE_IDLE;
	var subscribed = false;

	var processIncomingMsg = function (message) {
		if (message.type === 'error') {
			logger.error(message.message);
		} else
		if (message.type === 'notification') {
			logger.info(message.message);
		} else
		if (message.type === 'result') {
			if (message.success) {
				logger.info('Execution finished.')
			} else {
				logger.info('Execution error: ' + message.message);
			}
			currentState = STATE_IDLE;
		}
	};

	this.query = function () {
		return daemonConnector.publish('message', {
			type: 'QUERY'
		}).then(function (result) {
			if (result.state === 'STATE_PROCESSING') {
				currentState = STATE_EXECUTING;
			}
			return result;
		});
	};

	this.execute = function () {
		if (!subscribed) {
			daemonConnector.subscribe('message', processIncomingMsg);
			subscribed = true;
		}
		if (currentState === STATE_IDLE) {
			var code = codeEditor.getCode();
			daemonConnector.publish('message', {
				type: 'EXECUTE',
				code: code,
				start: '2015-01-01',
				end: '2015-12-31',
				initialAsset: 10000,
				targetPositions: 5,
				cutLossPercent: 0.1,
				tradeCommission: 0.001578,
				vat: 0.07,
				minDailyCommission: 50,
				slippagePercent: 0.01
			}).then(function (result) {
				if (result.success) {
					logger.info('Execution started.');
					currentState = STATE_EXECUTING;
					$rootScope.$emit('executionStarted');
				} else {
					logger.error(result.message);
				}
			});
		}
	};

	this.stop = function () {
		daemonConnector.publish('message', {type: 'STOP'})
			.then(function (result) {
				if (result.success) {
					logger.info('Execution stopped.');
					currentState = STATE_IDLE;
					$rootScope.$emit('executionStopped');
				}
			});
	};

});