// Controller zur Steuerung der Gruppenuebersicht
app.controller('groupsCtrl', function ($scope, $rootScope, dataService, $routeParams, $location) {
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'groups.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Daten fuer die Groups
    $scope.grps = {};
    $scope.hits = '';
    $scope.term = '';
    $scope.tag = '';


    // Methode zum Abruf von Gruppen
    $scope.getGroups = function(data){
        // Prueft ob uebergebene Daten Objekt sind, wenn nicht wird es zum LeerenObjekt
        var srch = (angular.isObject(data))?data:{};
        //Erstellen des Requests
        // Allgemeine Gruppen-Abfrage
        var request = {
            "reqType" : "getGroups"
        };

        // Pruefen ob ein Suchbegriff angegeben wurde
        if(srch.hasOwnProperty('term') &&
            srch.term.length > 0
        ){
            // Erweiterte Anfrage mit Suchterm
            $scope.term= srch.term;
            request.srchTerm = srch.term;
            // Erweiterte Anfrage mit einem Tag, wenn existent
            if(srch.hasOwnProperty('tag') &&
                srch.tag.length > 0
            ){
                request.tag = srch.tag;
            }

        }

        //Asynchrone Anfrage an den Server
        dataService.get(request, q)
            .then(function successCallback(data){
                var result = (angular.isObject(data))?data:{};
                if(!result.hasOwnProperty('msg')){
                    $scope.grps = result;
                    $scope.hits = result.length;
                }
                // Fehlerlausgabe des Servers
                else if (result.hasOwnProperty('msg') &&
                    result.msg.length > 0
                ) {
                    $scope.msg = result.msg;
                }
            });
        };

    // Eventlistener zur Entgegennahem von Such-Parametern
    $scope.$on('$routeChangeSuccess', function(){
        // Wenn Aufruf aus Suchfeld oder durch User -> Adressleiste
        var srch = {};
        if($location.path() == '/groups' && (typeof $routeParams.term == 'undefined' || typeof $routeParams.tag == 'undefined')){
            $scope.getGroups();
        }
        if($routeParams.term && $routeParams.tag){
            $scope.term = $routeParams.term;
            $scope.tag = $routeParams.tag;
            angular.extend(srch, $scope.term, $scope.tag);
            $scope.getGroups(srch);
        }
        else if($routeParams.term){
            srch.term = $routeParams.term;
            angular.extend(srch, $scope.term);
            $scope.getGroups(srch);
        }

    })
});