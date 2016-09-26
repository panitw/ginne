app.service('errorDialog', function (confirmDialog) {

	this.open = function (errorMessage) {
		return confirmDialog.open({
			title: 'Error',
			message: errorMessage,
			buttons: [
				{name: 'Close', class: 'primary'}
			]
		});
	}

});