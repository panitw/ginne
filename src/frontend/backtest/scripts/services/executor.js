app.service('executor', function (daemonConnector, codeEditor, logger) {

	var STATE_IDLE = 0;
	var STATE_EXECUTING = 1;

	var currentState = STATE_IDLE;
	var subscribed = false;

	var processIncomingMsg = function (message) {
		if (message.type === 'progress') {
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

	this.execute = function () {
		if (!subscribed) {
			daemonConnector.subscribe('execution', processIncomingMsg);
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
			});
			currentState = STATE_EXECUTING;
		}
	};

	this.stop = function () {
		daemonConnector.publish('message', {type: 'STOP'})
			.then(function (result) {
				if (result.success) {
					currentState = STATE_IDLE;
					logger.info('Execution stopped.');
				}
			});
	};

});