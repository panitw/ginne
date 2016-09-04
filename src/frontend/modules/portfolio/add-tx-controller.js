module.controller('PortfolioAddTxController', function($scope, txService) {

	$scope.vm = {
		mode: 'add',
		date: $scope.tx ? new Date($scope.tx.date): new Date(),
		txtype: $scope.tx ? $scope.tx.type: 'buy',
		symbol: $scope.tx ? $scope.tx.symbol: '',
		amount: $scope.tx ? $scope.tx.amount: '',
		price: $scope.tx ? $scope.tx.price: '',
		showSymbol: true,
		showPrice: true
	};

	$scope.delete = function () {
		if ($scope.tx) {
			txService.deleteTransaction($scope.tx._id)
				.then(function (result) {
					if (result.data.success) {
						$scope.closeDialog();
					} else {
						//TODO: Handle known backend error
					}
				})
				.catch(function () {
					//TODO: Handle unknown error
				});
		} else {
			$scope.closeDialog();
		}
	};

	$scope.save = function () {
		if (!$scope.tx) {
			$scope.tx = {};
		}
		$scope.tx.type = $scope.vm.txtype;
		$scope.tx.date = $scope.vm.date;
		$scope.tx.symbol = $scope.vm.symbol.toUpperCase();
		$scope.tx.amount = parseFloat($scope.vm.amount);
		$scope.tx.price = parseFloat($scope.vm.price);
		if ($scope.mode === 'edit') {
			txService.updateTransaction($scope.tx)
				.then(function (result) {
					if (result.data.success) {
						$scope.closeDialog();
					} else {
						//TODO: Handle known backend error
					}
				})
				.catch(function () {
					//TODO: Handle unknown error
				});
		} else {
			txService.addTransaction($scope.tx)
				.then(function (result) {
					if (result.data.success) {
						$scope.closeDialog();
					} else {
						//TODO: Handle known backend error
					}
				})
				.catch(function () {
					//TODO: Handle unknown error
				});
		}
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