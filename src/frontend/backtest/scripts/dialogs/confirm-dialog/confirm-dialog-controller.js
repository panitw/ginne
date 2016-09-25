app.controller('ConfirmDialogController', function ($scope, $uibModalInstance) {

	$scope.vm = {
		title: $scope.options.title,
		message: $scope.options.message,
		buttons: $scope.options.buttons
	};

	$scope.action = function (btn) {
		$uibModalInstance.close(btn.name);
	}

});