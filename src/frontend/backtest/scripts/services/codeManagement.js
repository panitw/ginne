app.service('codeManagement', function ($rootScope, logger) {

	var STATE_NEW = 0;
	var STATE_NEW_EDITED = 1;
	var STATE_SAVED = 2;
	var STATE_SAVED_EDITED = 3;

	var state = STATE_NEW;
	var codeData = {
		id: '0',
		name: 'Untitled Strategy'
	};

	this.codeEdited = function () {
		if (state === STATE_NEW) {
			state = STATE_NEW_EDITED;
		} else
		if (state === STATE_SAVED) {
			state = STATE_SAVED_EDITED
		}
		$rootScope.$emit('codeChanged');
	};

	this.setStrategyName = function (newName) {
		codeData.name = newName;
		this.codeEdited();
	};

	this.getStrategyName = function () {
		return codeData.name;
	};

	this.new = function () {

	};

	this.save = function () {

	};

	this.saveAs = function () {

	};

	this.open = function () {

	};

});