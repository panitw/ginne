app.controller('OpenDialogController', function ($scope, $uibModalInstance, strategyService) {

	$scope.vm = {
		strategyList: [],
		selectedIndex: -1
	};

	$scope.select = function (index) {
		$scope.vm.selectedIndex = index;
	};

	$scope.ok = function () {
		$uibModalInstance.close($scope.vm.strategyList[$scope.vm.selectedIndex]);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	strategyService.getStrategyList()
		.then(function (list) {
			if (list) {
				$scope.vm.strategyList = list;
			}
		});
});