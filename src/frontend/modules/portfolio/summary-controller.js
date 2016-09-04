module.controller('PortfolioSummaryController', function($scope, txService) {

	$scope.refreshData = function () {
		txService.getAllPositions().then(function (result) {
			console.log(result.data);
			var allPositions = result.data.positions.positions;
			for (var i=0; i<allPositions.length; i++) {
				var pos = allPositions[i];
				pos.last = 32;
				pos.averagePrice = pos.cost / pos.shares;
				pos.gain = pos.last - pos.averagePrice;
				pos.gainPct = (pos.gain / pos.last) * 100;
				pos.gainSign = (pos.gain > 0) ? '+' : '';
			}
			$scope.positions = allPositions;
			$scope.equity = result.data.positions.equity;
		});
	};

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

	$scope.refreshData();

});