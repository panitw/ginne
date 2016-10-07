app.service('executionParameters', function ($uibModal) {

	this.open = function () {
		var dialog = $uibModal.open({
			templateUrl: 'scripts/dialogs/execution-parameters/execution-parameters.html',
			size: 'md',
			controller: 'ExecutionParametersController'
		});
		return dialog.result;
	}

});