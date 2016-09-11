module.controller('EODController', function($scope, txService) {

	$scope.recommendation = {
		date: '...',
		buys: [],
		sells: []
	};

	$scope.refreshData = function () {
		txService.getAllRecommendations().then(function (result) {
			if (result.data && result.data.success) {
				var recs = result.data.recommendations;
				$scope.recommendation.buys = [];
				$scope.recommendation.sells = [];
				if (recs) {
					$scope.recommendation.date = moment(recs.date).format('DD-MMM-YYYY');
					recs.recommendations.forEach(function (item) {
						if (item.type === 'buy') {
							$scope.recommendation.buys.push(item);
						} else {
							$scope.recommendation.sells.push(item);
						}
					});
				}
			}
		});
	};

	$scope.refreshData();

});