app.controller('CodePanelController', function ($rootScope, $scope) {

	$scope.onCodeChange = function () {
		$rootScope.$emit('codeChanged');
	}

});