app.service('strategyService', function ($http, logger) {

	this.getStrategyList = function () {
		return $http.get('/strategy/list')
			.then(function (result) {
				if (result && result.data) {
					if (result.data.success) {
						return result.data.list;
					} else {
						logger.error('Fail loading strategy list');
						logger.error(result.data.exception);
						return null;
					}
				}
			});
	};

	this.getStrategyCode = function (id) {
		return $http.get('/strategy/' + id)
			.then(function (result) {
				if (result && result.data) {
					if (result.data.success) {
						return result.data.code;
					} else {
						logger.error('Fail loading strategy list');
						logger.error(result.data.exception);
						return null;
					}
				}
			});
	};

});