app.directive('logPanel', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'scripts/log-panel/log-panel.html',
		replace: true,
		link: function (scope, element, attrs) {

			var logPanel = element.find('.log-panel');

			function getTime () {
				return '[' + moment().format('DD-MM-YYYY hh:mm:ss') + ']';
			}

			$rootScope.$on('logInfo', function (e, message) {
				logPanel.append('<div class="log-line info">' + getTime() + ' ' + message + '</div>');
			});

			$rootScope.$on('logError', function (e, message) {
				logPanel.append('<div class="log-line error">' + getTime() + ' ' + message + '</div>');
			});

		}
	};
});