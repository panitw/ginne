app.service('logger', function ($rootScope) {

	this.info = function (message) {
		$rootScope.$emit('logInfo', message)
	};

	this.error = function (message) {
		$rootScope.$emit('logError', message)
	};

});