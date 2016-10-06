app.controller('EquityCurvePanelController', function ($rootScope, $scope) {
	$rootScope.$on('resultAvailable', function (e, result) {
		var transformedCurve = result.equityCurve.map(function (item) {
			return [
				new Date(item.__index).getTime(),
				item.equity
			];
		});
		$scope.curveData = {
			name: 'equity',
			data: transformedCurve
		}
	});
});