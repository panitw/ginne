app.controller('CodePanelController', function ($rootScope, $scope, codeManagement) {

	$rootScope.$on('strategyOpened', function (e, data) {
		$scope.setCode(data.code);
	});

	$scope.onCodeChange = function () {
		codeManagement.codeEdited();
	}

});