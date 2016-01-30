app.controller('createGroupCtrl', function($scope, $rootScope, $http, $location, $timeout, dataService){
    // Definieren von Eigenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'groups.handler.php';
    $scope.msg = '';
    $scope.newGroup = {};
    $scope.newGroupStatus = true;

    // Definieren von Methoden

    // Methode zum erstellen einer Gruppe
    $scope.addGroup = function(data, form){
        // Pruefen ob das Formular Valide und der Benutzer eingelogt ist
        if(form.$valid && $rootScope.user.uid >0){
            //Erweitern des Datensatzes durch die Anfrageart
            var reqType = { reqType : "createGroup",
                            uid: $rootScope.user.uid,
                            utoken: $rootScope.user.utoken};

            var request = angular.extend(data, reqType);

            // Absenden des Registrierungsformulars
            //Asynchrone Anfrage an den Server

            dataService.post(request, q)
                .then(function successResponse(data){
                    var result = (angular.isObject(data))?data:{};
                    if(result.hasOwnProperty('grpID')){
                        // Ausblendung des Formulars
                        $scope.newGroupStatus = false;
                        // Ausgabe einer Msg im p-Tag
                        $scope.msg = result.msg;
                        // Übergabe der GruppenID
                        var grpID = result.grpID;

                        //Nach der Einblendung der Msg wird ein timeout von 5sec gesetzt
                        //und Weiterleitung auf die erstellte Gruppe gesetzt
                        $timeout(function(){
                            var location = '/group/'+grpID;
                            $location.path(location);
                        } ,4000);
                    } // END IF grpID
                    else {
                        $scope.msg = result.msg;
                    }

                }); //END .then
        } //END IF $valid
    }
});