app.directive('layout', function ($templateRequest, $compile) {
	return {
		restricted: 'E',
		templateUrl: 'scripts/layout/layout.html',
		replace: true,
		link: function (scope, element) {

			scope.config = {
				content: [{
					type: 'row',
					content:[{
						type: 'component',
						componentName: 'template',
						componentState: { template: 'scripts/code-panel/code-panel.html' },
						title: 'Strategy Code'
					},{
						type: 'column',
						content:[{
							type: 'component',
							componentName: 'template',
							componentState: { template: 'scripts/equity-curve-panel/equity-curve-panel.html' },
							title: 'Equity Curve'
						},{
							type: 'component',
							componentName: 'template',
							componentState: { template: 'scripts/log-panel/log-panel.html' },
							title: 'Log Detail'
						}]
					}]
				}]
			};

			scope.layout = new GoldenLayout(scope.config, element);

			scope.layout.registerComponent( 'template', function(container, componentState) {
				$templateRequest(componentState.template).then(function (html) {
					var linkFn = $compile(html);
					var content = linkFn(scope);
					container.getElement().append(content);
				});
			});

			scope.layout.init();
		}
	};
});