// 1. Controller zur Sicherstellung, dass die Sessioninformationen bei einem Neuladen
// der Seite nicht verlohren gehen
// 2. Das Suchfeld wird mit einer Variablen im $rootScope versehen
// 3. Weiterleitung auf ie Suchfunktion
app.controller('appCtrl', function ($scope, $rootScope, $location, $timeout, $routeParams, $window, dataService) {
    // Eigenschaft fuer das Suchfeld
    var srchData = $rootScope.srch = {};
    srchData  = $rootScope.srch;
    srchData.term = '';
    srchData.tag = '';
    //Msg Ausgabe
    $scope.msg = '';
    $scope.menuToggle = false;

    // Toggle Methode des Menues
    $scope.toggle = function(){
        $scope.menuToggle = !$scope.menuToggle;
    };

    // Wenn user noch nicht initialisiert ist, dann wird er initialisiert
    if(!$rootScope.hasOwnProperty('user')){
        $rootScope.user = {};
        $rootScope.user.utoken = null;
        $rootScope.user.uid = null;
        $rootScope.user.credits = null;
        $rootScope.user.username = null;
    }
    // Eventlistener auf $rootScope.user.uid
    // Sollte der user eingelogt sein und die Benutzerinformationen durch Neuladen
    // verlohren gehen, dann werden die Informationen aus dem sessionStorage wiederhergestellt
    $rootScope.$watch('user.uid', function(newValue){
        var sUID= sessionStorage.getItem('uid');
        if(newValue == null && sUID != null){
            $rootScope.user.utoken = sessionStorage.getItem('utoken');
            $rootScope.user.uid = sessionStorage.getItem('uid');
            $rootScope.user.username = sessionStorage.getItem('username');
            $rootScope.user.credits = sessionStorage.getItem('credits');
        }

    });

    //Weiterleitung auf die Gruppen-Suchfunktion
    $scope.sendOn = function(){
        if(srchData.term.length > 0){
            // Wenn tag groesser 0, dann tag, sonst '';
            var tag = (srchData.tag.length > 0) ? srchData.tag : '';
            $location.path('/groups/'+srchData.term+'/'+tag);
        }
    };

    // Funktion zum Ausloggen
    $scope.logout = function(){
        // @ q : aufzurufende PHP-Datei
        var q = 'auth.handler.php';
        //Erstellen des Requests an den Server
        var request = {
            "reqType" : "logout"
        };

        //Asynchrone Anfrage an den Server
        dataService.get(request, q)
            .then(function successCalback(data){
                var result = (angular.isObject(data))?data:{};
                // Wenn Server geantwortet hat:
                // Leeren von User Variablen und sessionStorage
                sessionStorage.clear();
                $rootScope.user = {};
                // reload der gesamten Seit -- Erzeugung einer neuen Session
                $window.location.reload();
                // redirect auf Home
                $location.path('/');
            })
    };

    // Eventlistener zum Sperren von Routes, wenn user keine Berechtigung besitzt
    $scope.$on('$routeChangeStart', function (event, next) {

        //zugriff auf next als nächste Route und app.config.js access-Definition und Abgleich ob User eingeloggt ist
        if(next.access != undefined &&
            !next.access.allowAnonymous &&
            $rootScope.user.uid == null){
            $location.path('/login');
        }


    });
    // Ueberprufen ob der User die entsprechende User-Profilseite aufrufen darf

    $scope.$on('$routeChangeSuccess', function(event, next){

        var param = $routeParams.hasOwnProperty('username')?$routeParams.username:'';

        //(next.originalPath == '/user/:username' && (param != $rootScope.user.username || $rootScope.user.credits == 2)
        if( next.access != undefined && !next.access.allowAnonymous){
            if(next.originalPath == '/user/:username'){
                if(param != $rootScope.user.username){
                    if($rootScope.user.credits != 2){
                        $location.path('/login');
                    }
                }
            }
        }

    });

});