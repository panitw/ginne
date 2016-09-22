app.directive('layout', function () {
	return {
		restricted: 'E',
		templateUrl: 'scripts/layout/layout.html',
		replace: true,
		link: function (scope, element, attrs) {

			scope.config = {
				content: [{
					type: 'row',
					content:[{
						type: 'component',
						componentName: 'testComponent',
						componentState: { label: 'A' }
					},{
						type: 'column',
						content:[{
							type: 'component',
							componentName: 'testComponent',
							componentState: { label: 'B' }
						},{
							type: 'component',
							componentName: 'testComponent',
							componentState: { label: 'C' }
						}]
					}]
				}]
			};

			scope.layout = new GoldenLayout(scope.config, element);

			scope.layout.registerComponent( 'testComponent', function( container, componentState ){
				container.getElement().html( '<h2>' + componentState.label + '</h2>' );
			});

			scope.layout.init();
		}
	};
});