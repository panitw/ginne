app.service('codeManagement', function ($rootScope, openDialog, confirmDialog, saveAsDialog, errorDialog, strategyService, codeEditor, logger) {

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

	this.currentStrategy = function () {
		return codeData;
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

	this.resetDirtyFlag = function () {
		$rootScope.$emit('strategyDirtyFlagReset');
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
					//TODO: Display Error
				}
			});
		} else {
			this.resetStrategy();
		}
	};

	this.save = function () {
		if (state === STATE_SAVED) {
			return Promise.resolve();
		} else
		if (state === STATE_NEW || state === STATE_NEW_EDITED) {
			return this.saveAs();
		} else {
			var code = codeEditor.getCode();
			if (code) {
				return strategyService.saveStrategy(codeData.id, codeData.name, codeData.isMaster, code)
					.then(function () {
						logger.info('Strategy "' + codeData.name + '" has been saved.');
						state = STATE_SAVED;
						this.resetDirtyFlag();
					}.bind(this))
					.catch(function (err) {
						errorDialog.open(err.message);
					});
			} else {
				return Promise.reject(new Error('Code Editor is not ready'));
			}
		}
	};

	this.saveAs = function () {
		var code = codeEditor.getCode();
		if (code) {
			return saveAsDialog.open(codeData.name)
				.then(function (newName) {
					return strategyService.createStrategy(newName, code)
						.then(function () {
							logger.info('New strategy "' + newName + '" has been created.');
							state = STATE_SAVED;
							//No master created using saveAs method
							codeData.isMaster = false;
							$rootScope.$emit('strategyNameChanged', newName);
							$rootScope.$emit('strategyMasterReset', newName);
							this.resetDirtyFlag();
						}.bind(this))
						.catch(function (err) {
							errorDialog.open(err.message);
						});
				}.bind(this));
		} else {
			return Promise.reject(new Error('Code Editor is not ready'));
		}
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