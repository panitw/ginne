app.service('executor', function ($rootScope, daemonConnector, codeEditor, executionParameters, logger) {

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
		if (message.type === 'completed') {
			if (message.success) {
				logger.info('Execution finished.');
				if (message.result) {
					$rootScope.$emit('resultAvailable', message.result);
				}
			} else {
				logger.info('Execution error: ' + message.message);
			}
			currentState = STATE_IDLE;
			$rootScope.$emit('executionStopped');
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

	this.updateData = function () {
		return daemonConnector.publish('message', {
			type: 'UPDATE_DATA'
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
			executionParameters.open().then(function (params) {
				if (params) {
					var code = codeEditor.getCode();
					daemonConnector.publish('message', {
						type: 'EXECUTE',
						code: code,
						startDate: moment(params.startDate).format('YYYY-MM-DD'),
						endDate: moment(params.endDate).format('YYYY-MM-DD'),
						initialAsset: parseInt(params.initialAsset),
						targetPositions: parseInt(params.targetPositions),
						cutLossPercent: parseInt(params.cutLossPercent)/100,
						slippagePercent: parseInt(params.slippagePercent)/100
					}).then(function (result) {
						if (result.success) {
							logger.info('Execution started.');
							currentState = STATE_EXECUTING;
							$rootScope.$emit('executionStarted');
						} else {
							logger.error(result.message);
							logger.error(result.stack);
						}
					});
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