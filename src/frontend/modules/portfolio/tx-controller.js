module.controller('PortfolioTxController', function($scope, $window) {

	$scope.addTransaction = function () {
		$scope.mode = 'add';
		ons.createDialog('modules/portfolio/add-tx.html', {parentScope: $scope}).then(function(dialog) {
			$scope.currentDialog = dialog;
			dialog.show();
		});		
	};	

	$scope.editTransaction = function () {
		$scope.mode = 'edit';
		ons.createDialog('modules/portfolio/add-tx.html', {parentScope: $scope}).then(function(dialog) {
			$scope.currentDialog = dialog;
			dialog.show();
		});		
	}

	$scope.closeDialog = function () {
		if ($scope.currentDialog) {
			$scope.currentDialog.destroy();
			$scope.currentDialog = null;
		}
	}

});