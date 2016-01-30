// Direktive zum asynchronen Validieren ob angegebene Werte in der DB schon vergeben sind und einzigartig sein muessen
app.directive('asyncUnique', function($q,$http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.unique = function (modelValue, viewValue) {
                // @ q = aufzurufende PHP-Datei
                var q = 'auth.handler.php';

                // $q ist ein Service-Modul von Angular für asynchrone Validierungen
                var deferred = $q.defer();
                // Erstellen des request
                var request = {};
                request[attrs.name] = viewValue;

                // Erweitern des request durch die Anfrageart
                var reqType = { reqType : "uniqueUser" };
                request = angular.extend(request, reqType);

                // prüft ob das Inputfeld valide ist und nicht leer
                if(ngModel.$valid) {
                    // Asynchrone Anfrage ob der Username/Email schon vergeben sind
                    return $http.post('php/auth.handler.php', request)
                        .then(function (result){
                            // setzt die Validitaet des Inputfeldes auf true oder false
                            if(result.status){

                                deferred.resolve(); // Der angegebene Username oder Email sind noch nicht vergeben
                            }
                            else {

                                deferred.reject('exists'); // Vergebne -> Fuegt unique zu $error hinzu
                            }
                        }); //.then
                    } // IF
                else {
                    deferred.resolve();
                } // ELSE
                return deferred.promise;
                }; //ngModel.$asyncValidators.uniqueKey
            } //link
        }; //return
}); //derective
