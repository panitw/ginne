app.controller('MainMenuController', function ($rootScope, $scope, codeManagement) {

		$scope.vm = {
			dirtyFlag: false,
			strategyName: codeManagement.getStrategyName(),
			editingName: false
		};

		$rootScope.$on('codeChanged', function () {
			$scope.vm.dirtyFlag = true;
		});

		$rootScope.$on('strategyOpened', function (e, data) {
			$scope.vm.strategyName = data.strategy.name;
			$scope.vm.dirtyFlag = false;
		});

		$scope.new = function () {
			codeManagement.new();
		};

		$scope.open = function () {
			codeManagement.open();
		};

		$scope.editName = function () {
			$scope.vm.editingName = true;
		};

		$scope.renameKeyPressed = function (keyEvent) {
			if (keyEvent.which === 13) {
				$scope.vm.editingName = false;
				codeManagement.setStrategyName($scope.vm.strategyName);
			}
		};
	}
);