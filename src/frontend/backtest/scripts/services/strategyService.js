app.service('strategyService', function ($http, logger) {

	this.getStrategyList = function () {
		return $http.get('/strategy/list')
			.then(function (result) {
				if (result && result.data) {
					if (result.data.success) {
						var transformed = result.data.list.map(function (strategy) {
							if (strategy.name.indexOf('MASTER:') === 0) {
								strategy.name = strategy.name.replace('MASTER:', '');
								strategy.isMaster = true;
							} else {
								strategy.isMaster = false;
							}
							return strategy;
						});
						return transformed;
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

	this.checkNameExists = function (name, currentId) {
		this.getStrategyList()
			.then(function (list) {
				if (list) {
					var matched = list.filter(function (strategy) {
						if (strategy.name === name) {
							if (currentId !== undefined) {
								if (strategy.id !== currentId) {
									return true;
								}
							} else {
								return true;
							}
						}
					});
					return (matched.length > 0);
				} else {
					throw new Error('Unable to get current strategy list');
				}
			});
	};

	this.saveStrategy = function (id, name, isMaster, code) {
		return $http.put('/strategy/' + id, {
			name: (isMaster?'MASTER:':'') + name,
			code: code
		}).then(function (result) {
			if (result && result.data && result.data.success) {
				return true;
			} else {
				throw Error('Error updating strategy: ' + result.data.exception);
			}
		});
	};

	this.createStrategy = function (name, code) {
		return $http.post('/strategy', {
			name: name,
			code: code
		}).then(function (result) {
			if (result && result.data && result.data.success) {
				return true;
			} else {
				throw Error('Error saving strategy: ' + result.data.exception);
			}
		});
	}

});