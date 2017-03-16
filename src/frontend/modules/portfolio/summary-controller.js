module.controller('PortfolioSummaryController', function($scope, txService) {

	$scope.refreshData = function () {
		txService.getAllPositions().then(function (result) {
			var allPositions = result.data.positions.positions;
			var equity = 0;
			for (var i=0; i<allPositions.length; i++) {
				var pos = allPositions[i];
				pos.averagePrice = pos.cost / pos.shares;
				pos.gain = pos.last - pos.averagePrice;
				pos.gainPct = (pos.gain / pos.averagePrice) * 100;
				pos.gainSign = (pos.gain > 0) ? '+' : '';
				equity += (pos.shares * pos.last);
			}
			$scope.positions = allPositions;
			$scope.cash = result.data.positions.equity;
			$scope.equity = equity + $scope.cash;
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