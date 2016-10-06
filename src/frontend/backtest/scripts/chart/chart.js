app.directive('chart', function ($rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'scripts/chart/chart.html',
		scope: {
			data: '='
		},
		replace: true,
		link: function (scope, element, attrs) {
			scope.chart = new Highcharts.StockChart(element[0], {
				rangeSelector: {
					selected: 1
				},
				title: {
					text: attrs.title
				},
				navigator: {
					enabled: false
				},
				series: []
			});

			scope.$watch('data', function (newData) {
				if (newData) {
					while (scope.chart.series.length > 0) {
						scope.chart.series[0].remove(true);
					}
					scope.chart.addSeries({
						name: newData.name,
						data: newData.data
					});
				}
			});

			$rootScope.$on('layoutChanged', function (e) {
				scope.chart.reflow();
			});
		}
	};
});