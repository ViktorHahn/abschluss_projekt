// Controller zur Darstellung eines spezifischen Anwalts
app.controller('lawyerViewCtrl', function($scope, $rootScope, $location, $routeParams, $timeout, dataService){
    // Definieren von Eigenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'lawyers.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Daten des Lawyer
    $scope.lawyer = {};

    //EIgenschaften zum Bearbeiten des Lawyers
    $scope.lawyerEdited = false;
    $scope.delLawyer = false;
    $scope.delLawyerFlag = false;



    //Definieren von Methoden

    // Methode zum Aufruf des Lawyers by Id
    $scope.getLawyerByID = function (param) {

        //Erstellen des Requests
        var request = {
            "reqType" : "getLawyerByID",
            "lawyerID" : param.lawyerID,
            "lawyerName" : param.lawyerName
        };

        //Asynchrone Anfrage an den Server
        dataService.get(request, q)
            .then(function successCallback(data){
                var result = angular.isObject(data)?data:{};

                //Pruefen ob Obj nicht leer ist
                if(!angular.equals({},result)){
                    $scope.lawyer = result;
                }
                // Anwalt existiert nicht
                else if(result.hasOwnProperty('msg') &&
                    result.msg.length > 0
                ){
                    //Ausgabe MSG
                    $scope.msg = result.msg;
                    // redirect auf groups
                    $timeout(function(){
                        $scope.msg = '';
                        $location.path('/groups');
                    }, 3000)
                }
            });// END .then

    };


    // Methode zum Update des Lawyers
    $scope.updateLawyerByID = function(){
        // Abrage ob LawyrID existiert und User berechtigt ist
        if($scope.lawyer.userID == $rootScope.user.uid ||
            $rootScope.user.credits == 2
        ){
            // Copy Lawyer
            var editedLawyer = angular.copy($scope.lawyer);
            // Erstellen des requests
            var reqType = {
                "reqType" : "updateLawyerByID",
                "uid" : $rootScope.user.uid
            };
            var request = angular.extend(editedLawyer, reqType);

            dataService.put(request, q)
                .then(function successCallback(data){
                    var result = angular.isObject(data)?data:{};

                    if(result.hasOwnProperty('msg')){
                        // Ausgabe msg
                        $scope.msg = result.msg;
                        $timeout(function(){
                            $scope.msg = '';
                        }, 5000)
                    }
                })

        }
    };


    // Methode zum Loeschen des Lawyers
    $scope.deleteLawyerByID = function () {
        // Ausgabe des Confirmdeldes
        $scope.delLawyerFlag = true;
        // Warten auf Confirm
        $scope.$watch('delLawyer', function(){
            // Abfrage ob userID existiert und User berechtigt ist
            if($scope.delLawyer == true &&
                $scope.lawyer.userID &&
                ($scope.lawyer.userID == $rootScope.uid ||
                $rootScope.user.credits == 2)
            ) {
                //Erstellen des Requests
                var request = {
                    "reqType": "deleteLawyerByID",
                    "userID": $scope.lawyer.userID,
                    "uid": $rootScope.user.uid
                };
                console.dir(request);
                dataService.del(request, q)
                    .then(function successCallback(data){
                        var result = angular.isObject(data)?data:{};

                        if(result.hasOwnProperty('msg')) {
                            // Ausgabe msg
                            $scope.msg = result.msg;
                            $timeout(function () {
                                $scope.msg = '';
                                $scope.dellawyer = false;
                                $scope.dellawyerFlag = false;
                            }, 4000);
                        }
                        if(result.hasOwnProperty('deleted') &&
                            result.deleted
                        ){
                            // redirect
                            $timeout(function () {
                                $scope.dellawyer = false;
                                $scope.dellawyerFlag = false;
                                $location.path('/lawyers');
                            }, 4000);
                        }
                    })
            }
        })
    };


    // Eventlistener fuer das Laden des Lawyers by ID
    $scope.$on('$routeChangeSuccess', function(){
        // ueberpruefen ob routeParams lawyer-Name gesetzt ist
        var param = {
            lawyerName : $routeParams.lawyerName ? $routeParams.lawyerName : false,
            lawyerID : $routeParams.lawyerID ? $routeParams.lawyerID : false
        };

        // Aufruf der Methode getLawyerByID
        if(param.lawyerID && param.lawyerName){
            $scope.getLawyerByID(param);
        }
        // Umleitung auf Lawyers, wenn lawyername und lawyerID nicht vorhanden sind
        else {
            $scope.msg = 'Der von Ihnen gesuchte Anwalt oder Anwältin konnte nicht gefunden werden.';
            $timeout(function(){
                $scope.msg = '';
                $location.path('/lawyers');
            }, 3000)
        }
    });


    //Eventlistener ob lawyer-obj bearbeitet wurde
    $scope.$watchCollection('lawyer', function(newValue, oldValue){
        // ist object leer? -- Listener wuerde sonst bei init feuern
        if(!angular.equals({},newValue) && !angular.equals({},oldValue)){
            // Wenn grp beatrbeitet wurde dann einblenden des Absenden-Buttons durch flag
            $scope.lawyerEdited = true;
        }
    });
});