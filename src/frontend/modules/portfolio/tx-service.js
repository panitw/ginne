module.service('txService', function($http) {

    this.getAllTransactions = function () {
        return $http.get('portfolio/transactions');
    };

    this.addTransaction = function () {

    };
});