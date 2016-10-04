app.controller('ChartController', function ($rootScope, $scope) {

	$rootScope.$on('layoutChanged', function (e) {
		$scope.chart.reflow();
	});

});