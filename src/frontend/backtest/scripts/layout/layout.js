app.directive('layout', function ($rootScope, $templateRequest, $compile, $window) {
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
						componentState: { template: '<code-panel></code-panel>' },
						title: 'Strategy Code'
					},{
						type: 'column',
						width: 45,
						content:[
							{
								type: 'stack',
								content: [
									{
										type: 'component',
										componentName: 'template',
										componentState: { template: '<equity-curve-panel></equity-curve-panel>' },
										title: 'Equity Curve',
									},
									{
										type: 'component',
										componentName: 'template',
										componentState: { template: '<result-table></result-table>' },
										title: 'Result',
									},
									{
										type: 'component',
										componentName: 'template',
										componentState: { template: '<transactions-table></transactions-table>' },
										title: 'Transactions',
									}
								]
							},
							{
								type: 'component',
								componentName: 'template',
								componentState: { template: '<log-panel></log-panel>' },
								title: 'Log Detail',
								height: 50
							}
						]
					}]
				}]
			};

			scope.layout = new GoldenLayout(scope.config, element);

			scope.layout.registerComponent( 'template', function(container, componentState) {
				var linkFn = $compile(componentState.template);
				var content = linkFn(scope);
				container.getElement().append(content);
			});

			scope.layout.on('stateChanged', function () {
				$rootScope.$emit('');
			});

			scope.layout.init();

			$window.addEventListener('resize', function () {
				scope.layout.updateSize();
			});
		}
	};
});