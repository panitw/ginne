app.service('codeManagement', function ($rootScope, openDialog, confirmDialog, strategyService, logger) {

	var STATE_NEW = 0;
	var STATE_NEW_EDITED = 1;
	var STATE_SAVED = 2;
	var STATE_SAVED_EDITED = 3;

	var NEW_TEMPLATE = "'use strict';\n\nclass Strategy {\n\n	analyze (analyzer) {\n	}\n\n	execute (executor) {\n	}\n\n}\n";

	var state = STATE_NEW;
	var codeData = {
		id: '0',
		name: 'New Untitled Strategy'
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
		if (codeData.name !== newName) {
			codeData.name = newName;
			this.codeEdited();
		}
	};

	this.getStrategyName = function () {
		return codeData.name;
	};

	this.resetStrategy = function () {
		state = STATE_NEW;
		codeData = {
			id: '0',
			name: 'New Untitled Strategy'
		};
		$rootScope.$emit('strategyOpened', {
			strategy: codeData,
			code: NEW_TEMPLATE
		});
	};

	this.new = function () {
		if (state === STATE_NEW_EDITED || state === STATE_SAVED_EDITED) {
			confirmDialog.open({
				title: 'Confirm',
				message: 'You are losing unsaved data. Do you want to save changes to the current strategy?',
				buttons: [
					{name: 'Save', class: 'primary'},
					{name: 'Discard', class: 'warning'},
					{name: 'Cancel'}
				]
			}).then(function (result) {
				if (result === 'Save') {
					return this.save();
				}
				if (result === 'Cancel') {
					throw 'CANCEL'
				}
			}.bind(this)).then(function () {
				this.resetStrategy();
			}.bind(this)).catch(function (err) {
				if (err !== 'CANCEL') {

				}
			});
		} else {
			this.resetStrategy();
		}
	};

	this.save = function () {

	};

	this.saveAs = function () {

	};

	this.open = function () {
		var openedStrategy = null;
		openDialog.open()
			.then(function (strategy) {
				openedStrategy = strategy;
				return strategyService.getStrategyCode(openedStrategy.id);
			})
			.then(function (code) {
				if (code) {
					state = STATE_SAVED;
					codeData = openedStrategy;
					logger.info('Strategy "' + openedStrategy.name + '" has been opened.');
					$rootScope.$emit('strategyOpened', {
						strategy: openedStrategy,
						code: code
					});
				}
			});
	};

});