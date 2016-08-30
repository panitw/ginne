module.controller('PortfolioSummaryController', function($scope, $window) {

	$scope.addTransaction = function () {
		if ($window.addTxDialog === undefined) {
			ons.createDialog('modules/portfolio/add-tx.html').then(function(dialog) {
				dialog.show();
			});
		} else {
			$window.addTxDialog.show();
		}
	};

});