app.service('codeEditor', function () {

	var _editor = null;

	this.setEditor = function (editor) {
		_editor = editor;
	}

	this.getCode = function () {
		if (_editor) {
			return _editor.getValue();
		} else {
			return null;
		}
	};

});