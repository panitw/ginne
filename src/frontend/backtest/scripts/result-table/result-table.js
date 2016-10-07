app.directive('resultTable', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'scripts/result-table/result-table.html',
		scope: {
			data: '='
		},
		replace: true,
		link: function (scope, element, attrs) {
			$rootScope.$on('resultAvailable', function (e, result) {
				scope.finalAsset = result.endCapital;
				scope.drawdownDuration = result.drawdownDuration;
				scope.maximumDrawdown = result.maximumDrawdown;
				scope.netProfit = result.netProfit;
				scope.netProfitPercent = result.percentNetProfit;
				scope.CGAR = result.CAGRPercent;
			});
		}
	};
});