module.controller('PortfolioAddTxController', function($scope, txService) {

	$scope.vm = {
		mode: 'add',
		date: new Date(),
		txtype: 'buy',
		symbol: '',
		amount: '',
		price: '',
		showSymbol: true,
		showPrice: true
	};

	$scope.save = function () {
		var txObj = {
			type: $scope.vm.txtype,
			date: $scope.vm.date,
			symbol: $scope.vm.symbol.toUpperCase(),
			amount: parseFloat($scope.vm.amount),
			price: parseFloat($scope.vm.price)
		};
		txService.addTransaction(txObj)
			.then(function (result) {
				if (result.data.success) {
					$scope.closeDialog();
				} else {

				}
			})
			.catch(function () {

			});
	};

	$scope.cancel = function () {
		$scope.closeDialog();
	}

	$scope.$watch('vm.txtype', function (newValue) {
		if (newValue === 'buy' || newValue === 'sell') {
			$scope.vm.showSymbol = true;
			$scope.vm.showPrice = true;
		} else {
			$scope.vm.showSymbol = false;
			$scope.vm.showPrice = false;
		}
	});

});