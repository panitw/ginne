var app = angular.module('backtester', ['ngAnimate', 'ui.bootstrap']);

app.run(function (daemonConnector) {
	daemonConnector.connect();
});