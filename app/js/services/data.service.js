app.factory('dataService', ['$http', function ($http) {

    // Definieren von Eigeschaften
    var baseUrl = 'php/';
    var dataSrv = {};

    // Definieren von Methoden

    // @ param req -> Übergabe von Daten an den Server
    // @ param q -> Verfollständigung des Pfades der angesteuerten PHP-Datei
    // Rueckgabe der Daten erfolgt in Form eines Objektes

    // Get-Anfragen
    dataSrv.get = function(data, q){
        var reqCase = {reqCase:"get"};
        var req = angular.extend(data,reqCase);
        return $http.post(baseUrl + q, req)
            .then(function (result) {
                return result.data;
            })
    };

    // Post-Anfragen
    dataSrv.post = function(data, q){
        var reqCase = {reqCase:"post"};
        var req = angular.extend(data,reqCase);
        return $http.post(baseUrl + q, req)
            .then(function (result) {
                return result.data;
            })
    };

    // Update/Put-Anfragen
    dataSrv.put = function(data, q){
        var reqCase = {reqCase:"put"};
        var req = angular.extend(data,reqCase);
        return $http.post(baseUrl + q, req)
            .then(function (result) {
                return result.data;
            })
    };

    // Delete-Anfragen
    dataSrv.del = function(data, q){
        var reqCase = {reqCase:"delete"};
        var req = angular.extend(data,reqCase);
        return $http.post(baseUrl + q, req)
            .then(function (result) {
                return result.data;
            })
    };

    // Oeffentliche API
    return {
        get : function (data, q) {
            return dataSrv.get(data, q);
        },
        post: function (data, q) {
            return dataSrv.post(data, q)
        },
        put: function (data, q) {
            return dataSrv.put(data, q)
        },
        del: function (data, q) {
            return dataSrv.del(data, q)
        }
    }
}]);