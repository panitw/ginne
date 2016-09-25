app.directive('codePanel', function () {
	return {
		restrict: 'E',
		templateUrl: 'scripts/code-panel/code-panel.html',
		replace: true,
		link: function (scope, element) {

			var forceSettingValue = false;

			scope.editor = ace.edit(element.find('.code-editor')[0]);
			scope.editor.setTheme('ace/theme/twilight');
			scope.editor.getSession().setMode('ace/mode/javascript');

			scope.editor.getSession().on('change', function() {
				if (!forceSettingValue) {
					scope.onCodeChange();
					scope.$apply();
				}
			});

			scope.setCode = function (code) {
				forceSettingValue = true;
				scope.editor.setValue(code);
				scope.editor.getSession().selection.clearSelection();
				forceSettingValue = false;
			}
		}
	};
});