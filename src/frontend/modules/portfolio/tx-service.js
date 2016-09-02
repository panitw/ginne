module.service('txService', function($http) {

    this.getAllTransactions = function () {
        return $http.get('portfolio/transactions');
    };

    this.addTransaction = function (tx) {
        return $http.post('portfolio/transactions', tx);
    };
});