app.controller('ExecutionParametersController', function ($scope, $uibModalInstance) {

	$scope.vm = {
		initialAsset: 100000,
		startDate: new Date(),
		endDate: new Date(),
		startYear: 2015,
		endYear: 2015,
		cutLossPercent: 20,
		slippagePercent: 2,
		targetPositions: 5,
		yearList: []
	};

	var currentYear = (new Date()).getFullYear();

	for (var i=currentYear; i>=2000; i--) {
		$scope.vm.yearList.push(i);
	}

	$scope.ok = function () {
		$uibModalInstance.close($scope.vm);
	};

	$scope.cancel = function () {
		$uibModalInstance.dismiss('cancel');
	};

	$scope.$watch('vm.startYear', function (newValue) {
		$scope.vm.startDate = new Date(newValue + '-01-01');
	});

	$scope.$watch('vm.endYear', function (newValue) {
		$scope.vm.endDate = new Date(newValue + '-12-31');
	});
});