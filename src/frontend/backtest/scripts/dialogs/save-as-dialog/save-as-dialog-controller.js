app.controller('SaveAsDialogController', function ($scope, $uibModalInstance, strategyService) {

	$scope.vm = {
		name: $scope.preName,
		nameEditable: false,
		validated: false,
		nameAlreadyExists: false
	};

	$scope.strategyList = null;

	$scope.ok = function () {
		$uibModalInstance.close($scope.vm.name);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.validate = function () {
		if ($scope.strategyList) {
			var matched = $scope.strategyList.filter(function (strategy) {
				if (strategy.name === $scope.vm.name) {
					return true;
				}
				return false;
			});
			$scope.vm.validated = (matched.length === 0);
			$scope.vm.nameAlreadyExists = (matched.length > 0);
		} else {
			$scope.vm.validated = false;
		}
	};

	$scope.$watch('vm.name', function () {
		$scope.validate();
	});

	strategyService.getStrategyList()
		.then(function (list) {
			if (list) {
				$scope.strategyList = list;
				$scope.vm.nameEditable = true;
				$scope.validate();
			}
		});
});