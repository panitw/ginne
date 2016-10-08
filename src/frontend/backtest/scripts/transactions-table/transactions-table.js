app.directive('transactionsTable', function () {
	return {
		restrict: 'E',
		templateUrl: 'scripts/transactions-table/transactions-table.html',
		replace: true,
		link: function (scope, element, attrs) {
		},
		controller: function ($scope, $rootScope) {

			$scope.transactions = [];

			$rootScope.$on('resultAvailable', function (e, result) {
				$scope.transactions = result.transactions;
			});

			$scope.getTypeName = function (code) {
				switch (code) {
					case 'B':
						return 'Buy';
					case 'S':
						return 'Sell';
					case 'C':
						return 'Commission';
				}
			};

			$scope.formatDate = function (d) {
				return moment(d).format('YYYY-MM-DD');
			};

		}
	};
});