module.controller('PortfolioTxController', function($scope, txService) {

	$scope.refreshData = function () {
		txService.getAllTransactions().then(function (result) {
			if (result.data && result.data.success) {
				var txByDate = {};
				var dateList = [];
				for (var i=0; i< result.data.transactions.length; i++) {
					var tx = result.data.transactions[i];
					var dateStr = moment(tx.date).format('DD-MMM-YYYY');
					if (!txByDate[dateStr]) {
						txByDate[dateStr] = [];
						dateList.push(dateStr);
					}
					txByDate[dateStr].push(tx);
				}
				$scope.transactions = [];
				for (var i=0; i<dateList.length; i++) {
					$scope.transactions.push({
						date: dateList[i],
						txList: txByDate[dateList[i]]
					});
				}
			}
		});
	};

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
	};

	$scope.closeDialog = function () {
		if ($scope.currentDialog) {
			$scope.currentDialog.destroy();
			$scope.currentDialog = null;
		}
		$scope.refreshData();
	};

	$scope.refreshData();

});