app.directive('chart', function () {
	return {
		restrict: 'E',
		templateUrl: 'scripts/chart/chart.html',
		replace: true,
		link: function (scope, element) {
			scope.chart = new Highcharts.Chart(element[0], {
				rangeSelector: {
					selected: 1
				},
				title: {
					text: 'AAPL Stock Price'
				},
				series: [{
					name: 'AAPL',
					data: [
						[1253750400000,26.26],
						[1253836800000,26.05],
						[1254096000000,26.59],
						[1254182400000,26.48],
						[1254268800000,26.48]
					],
					tooltip: {
						valueDecimals: 2
					}
				}]
			});
			scope.chart.setOptions(Highcharts.theme);
		}
	};
});