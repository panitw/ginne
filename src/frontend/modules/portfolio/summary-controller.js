module.controller('PortfolioSummaryController', function($scope, $window) {

	$scope.addTransaction = function () {
		var newScope = $scope.$new();
		newScope.mode = 'add';
		newScope.closeDialog = function () {
			if ($scope.currentDialog) {
				$scope.currentDialog.destroy();
				$scope.currentDialog = null;
			}
		};

		ons.createDialog('modules/portfolio/add-tx.html', {parentScope: newScope}).then(function(dialog) {
			$scope.currentDialog = dialog;
			dialog.show();
		});
	};

});