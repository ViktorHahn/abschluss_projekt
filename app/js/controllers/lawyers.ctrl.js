// Controller ist fuer die Dastellung der Uebersicht der Anwaelte zustaendig
app.controller('lawyersCtrl', function ($scope, $rootScope, $location, dataService) {
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'lawyers.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Daten fuer die Groups
    $scope.lawyers = {};

    // Methode zum Erstaufruf
    $scope.getLawyers = function(data) {

        //Erstellen des Requests
        // Allgemeine Gruppen-Abfrage
        var request = {
            "reqType": "getLawyers"
        };

        //Asynchrone Anfrage an den Server
        dataService.get(request, q)
            .then(function successCallback(data){

                var result = (angular.isObject(data))?data:{};
                if(!result.hasOwnProperty('msg')){
                    $scope.lawyers = result;
                }
                // Fehlerlausgabe des Servers
                else if (result.hasOwnProperty('msg') &&
                    result.msg.length > 0
                ){
                    $scope.msg = result.msg;
                    // redirect auf groups
                    $timeout(function(){
                        $scope.msg = '';
                        $location.path('/groups');
                    }, 2500)
                }
            });
    };

    //todo Pagination

    // Eventlistener fuer die Seitenaufrufe von groups und lawyers
    $scope.$on('$routeChangeSuccess', function(){

        if($location.path() == '/lawyers'){
            $scope.getLawyers();
        }
    })
});