app.service('confirmDialog', function ($rootScope, $uibModal) {

	this.open = function (options) {
		var newScope = $rootScope.$new();
		newScope.options = options;
		var dialog = $uibModal.open({
			templateUrl: 'scripts/dialogs/confirm-dialog/confirm-dialog.html',
			size: 'md',
			controller: 'ConfirmDialogController',
			scope: newScope
		});
		return dialog.result;
	};

});