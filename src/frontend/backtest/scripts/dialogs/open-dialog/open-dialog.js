app.service('openDialog', function ($uibModal) {

	this.open = function () {
		var dialog = $uibModal.open({
			templateUrl: 'scripts/dialogs/open-dialog/open-dialog.html',
			size: 'md',
			controller: 'OpenDialogController'
		});
		return dialog.result;
	}

});