module.service('txService', function($http) {

    this.getAllTransactions = function () {
        return $http.get('portfolio/transactions');
    };

    this.addTransaction = function (tx) {
        return $http.post('portfolio/transactions', tx);
    };

    this.updateTransaction = function (tx) {
        return $http.put('portfolio/transactions/' + tx._id, tx);
    }
});