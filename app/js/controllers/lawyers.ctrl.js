// Controller ist fuer die Dastellung der Uebersicht der Anwaelte zustaendig
app.controller('lawyersCtrl', function ($scope, $rootScope, $location, $routeParams, dataService) {
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'lawyers.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Daten fuer die Groups
    $scope.lawyers = {};
    $scope.hits = '';
    $scope.lterm = '';
    $scope.ltag = '';

    // Methode zum Erstaufruf
    $scope.getLawyers = function(data) {
        // Prueft ob uebergebene Daten Objekt sind, wenn nicht wird es zum LeerenObjekt
        var srch = (angular.isObject(data))?data:{};
        //Erstellen des Requests
        // Allgemeine Gruppen-Abfrage
        var request = {
            "reqType": "getLawyers"
        };
        // Pruefen ob ein Suchbegriff angegeben wurde
        if(srch.hasOwnProperty('lterm') &&
            srch.lterm.length > 0
        ){
            // Erweiterte Anfrage mit Suchterm
            $scope.lterm= srch.lterm;
            request.lsrchTerm = srch.lterm;
            // Erweiterte Anfrage mit einem Tag, wenn existent
            if(srch.hasOwnProperty('ltag') &&
                srch.ltag.length > 0
            ){
                request.ltag = srch.ltag;
            }

        }

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


    // Eventlistener fuer die Seitenaufrufe von groups und lawyers
    $scope.$on('$routeChangeSuccess', function(){
        // Wenn Aufruf aus Suchfeld oder durch User -> Adressleiste
        var srch = {};

        if($location.path() == '/lawyers' && (typeof $routeParams.lterm == 'undefined' || typeof $routeParams.ltag == 'undefined')){
            $scope.getLawyers();
        }
        if($routeParams.lterm && $routeParams.ltag){
            $scope.ltag = $routeParams.ltag;
            $scope.lterm = $routeParams.lterm;
            angular.extend(srch, $routeParams);
            $scope.getLawyers(srch);
        }
        else if($routeParams.lterm){
            console.dir($routeParams);
            srch.lterm = $routeParams.lterm;
            angular.extend(srch, $scope.lterm);
            $scope.getLawyers(srch);
        }

    })
});