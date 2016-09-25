app.controller('MainMenuController', function ($rootScope, $scope) {

		$scope.vm = {
			dirtyFlag: false,
			previousName: 'Untitled Strategy',
			strategyName: 'Untitled Strategy',
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
				if ($scope.vm.strategyName !== $scope.vm.previousName) {
					$scope.vm.dirtyFlag = true;
				}
			}
		};
	}
);