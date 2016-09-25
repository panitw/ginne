app.service('saveAsDialog', function ($rootScope, $uibModal) {

	this.open = function (preName) {
		var newScope = $rootScope.$new();
		newScope.preName = preName;
		var dialog = $uibModal.open({
			templateUrl: 'scripts/dialogs/save-as-dialog/save-as-dialog.html',
			size: 'md',
			controller: 'SaveAsDialogController',
			scope: newScope
		});
		return dialog.result;
	}

});