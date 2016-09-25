app.controller('CodePanelController', function ($rootScope, $scope, codeManagement) {

	$scope.onCodeChange = function () {
		codeManagement.codeEdited();
	}

});