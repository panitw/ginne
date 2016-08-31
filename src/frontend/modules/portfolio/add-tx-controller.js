module.controller('PortfolioAddTxController', function($scope) {

	$scope.vm = {
		mode: 'add',
		date: new Date(),
		txtype: 'buy',
		showSymbol: true,
		showPrice: true
	};

	$scope.add = function () {

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