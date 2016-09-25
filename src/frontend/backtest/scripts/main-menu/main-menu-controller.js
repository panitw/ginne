app.controller('MainMenuController', function ($rootScope, $scope, codeManagement) {

		$scope.vm = {
			dirtyFlag: false,
			strategyName: codeManagement.getStrategyName(),
			editingName: false
		};

		$rootScope.$on('codeChanged', function () {
			$scope.vm.dirtyFlag = true;
		});

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