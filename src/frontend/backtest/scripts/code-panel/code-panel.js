app.directive('codePanel', function () {
	return {
		restrict: 'E',
		templateUrl: 'scripts/code-panel/code-panel.html',
		replace: true,
		link: function (scope, element) {
			scope.editor = ace.edit(element.find('.code-editor')[0]);
			scope.editor.setTheme('ace/theme/twilight');
			scope.editor.getSession().setMode('ace/mode/javascript');

			scope.editor.getSession().on('change', function(e) {
				scope.onCodeChange();
				scope.$apply();
			});
		}
	};
});