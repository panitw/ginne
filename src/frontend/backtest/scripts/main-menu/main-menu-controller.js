app.controller('MainMenuController', function ($rootScope, $scope, codeManagement) {

	$scope.vm = {
		dirtyFlag: false,
		strategyName: codeManagement.getStrategyName(),
		editingName: false,
		isMaster: false
	};

	$rootScope.$on('codeChanged', function () {
		$scope.vm.dirtyFlag = true;
	});

	$rootScope.$on('strategyOpened', function (e, data) {
		$scope.vm.strategyName = data.strategy.name;
		$scope.vm.dirtyFlag = false;
		$scope.vm.isMaster = data.strategy.isMaster;
	});

	$rootScope.$on('strategyNameChanged', function (e, newName) {
		$scope.vm.strategyName = newName;
	});

	$rootScope.$on('strategyDirtyFlagReset', function () {
		$scope.vm.dirtyFlag = false;
	});

	$rootScope.$on('strategyMasterReset', function () {
		$scope.vm.isMaster = codeManagement.currentStrategy().isMaster;
	});

	$scope.new = function () {
		codeManagement.new();
	};

	$scope.open = function () {
		codeManagement.open();
	};

	$scope.save = function () {
		codeManagement.save();
	};

	$scope.saveAs = function () {
		codeManagement.saveAs();
	};

	$scope.editName = function () {
		$scope.vm.editingName = true;
	};

	$scope.resetName = function () {
		$scope.vm.editingName = false;
		$scope.vm.strategyName = codeManagement.currentStrategy().name;
	}

	$scope.renameKeyPressed = function (keyEvent) {
		switch (keyEvent.which) {
			case 13: //Enter
				$scope.vm.editingName = false;
				codeManagement.setStrategyName($scope.vm.strategyName);
				break;
		}
	};
});