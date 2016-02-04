// Controller zur Userauthentifikation
app.controller('authCtrl', function ($scope, $rootScope, $location, $http, $routeParams, $timeout, dataService) {
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'auth.handler.php';
    $scope.errMsg = '';
    $scope.regUser = {};

    // Eigenschaften fuer den Registrierungsvorgang
    // @ regStatus : Flag zum Ein- und Ausblenden des Registrierunsformulars
    $scope.regStatus = true;
    // @ msg : Wenn nicht leer, wird die Nachricht ausgegeben
    $scope.msg = '';
    // @ regSuccess : Flag zum Ein- und Ausblenden des Loginformulars
    $scope.regSuccess = false;


    // Definieren von Methoden

    // Setzt die Validität des Fromulars auf true bei der Verängerung der
    // Inputfelder nach Fehllogin. Dadurch wird die Ausgabe einer Felermeldung getriggert
    // das erneute Absenden des Fromulars, ohne Veraenderung, geblockt.
    // Aufgerufen durch ngChange-Direktive der Inputfelder
    $scope.setLogErr = function(){
        $scope.form.$setValidity('logerr', true);
    };

    // Login Funktion
    // @param loginData erwartet den Scope der Users
    // @param form erwartet das gesamte FormularObjekt
    $scope.login = function (loginData, form) {

        // Erweitern des Datensatzes durch die Anfrageart
        var reqType = { reqType: "login" };
        var request = angular.extend(loginData, reqType);

        // Ueberprueft die Validitaet des Formulars
        if(form.$valid){
            //Asynchrone Anfrage an den Server
            dataService.get(request, q)
                .then(function successesCallback(data) {
                    var result = (angular.isObject(data))?data:{};

                    // Abfrage ob der Anmeldevorgang am Server erfolgreich war
                    // oder der User schon angemeldet ist
                    if( !$http.defaults.headers.common.hasOwnProperty('U_TOKEN') &&
                        result.hasOwnProperty('username') &&
                        result.hasOwnProperty('utoken') &&
                        result.hasOwnProperty('credits') &&
                        !result.hasOwnProperty('errMsg')
                    ){
                        // Anlegen von Userdaten im $rootScope.user & im sessionStorage

                        sessionStorage.setItem('utoken',result.utoken);
                        sessionStorage.setItem('uid',result.uid);
                        sessionStorage.setItem('username',result.username);
                        sessionStorage.setItem('credits',result.credits);
                        $rootScope.user.utoken = sessionStorage.getItem('utoken');
                        $rootScope.user.uid = sessionStorage.getItem('uid');
                        $rootScope.user.username = sessionStorage.getItem('username');
                        $rootScope.user.credits = sessionStorage.getItem('credits');

                        // Setzt einen Usertokens für zuküftige Anfragen des
                        // $http-Services und wird mittels headers übertragen.
                        // Token wird serverseitig durch PHP beim Einlogen des Userserzeugt
                        $http.defaults.headers.common['U_TOKEN'] = sessionStorage.getItem('utoken');
                        // Leitet den User auf seine Profilseite um
                        $location.path('/groups');
                    } // if
                    // Login fehlgeschlagen
                    else if(result.hasOwnProperty('errMsg')){
                        $scope.errMsg = result.errMsg;

                    } // else if
            }), function errorCallback(){
                // Server gibt keine Antwort
                $scope.form.$setValidity('logerr', false);
                $scope.errMsg = 'Ein Login ist zur Zeit nicht möglich. Bitte versuchen Sie später oder Kontaktieren Sie uns.';
            }; // end .get
        } else {
            //Formular ist nicht valide.
            $scope.form.$setValidity('logerr', false);
            $scope.errMsg = 'Bitte füllen Sie alle Felder aus.';
        } // if valid
    };

    // Funktion zum zurücksetzen des Register-Formulars
    $scope.clearForm = function(form){
        $scope.regUser = {};
        form.$setPristine();
        form.$setUntouched();
    };

    // Funktion zum Vergleich der Values von Inputgfeldern
    // Email/Password
    // @param Erwartet das gesamte FormularObjekt
    $scope.valEquals = function(inputObj1, inputObj2){
        //Setzt Validitaet bei aufruf auf false
        inputObj1.$setValidity('notmatching', true);

        // Abfrage ob Inputfelder valide sind
        if(inputObj1.$valid && inputObj2.$valid){
            // Abgleich ob der Value übereinstimmt
            if(!angular.equals(inputObj1.$modelValue, inputObj2.$modelValue)){
                // Setzen der Validitaet eines Inpuntfeldes auf true
                inputObj1.$setValidity('notmatching', false);
            }

        }
    };

    // Funktion zum Registrieren eines neuen Nutzers
    // @param loginData : erwartet den Scope des Users
    // @param form : erwartet das gesamte FormularObjekt
    $scope.addUser = function (regData, form) {

        // Entfernen der nicht benoetigten Keys aus regData
        delete regData.confpassword;
        delete regData.conf_email;

        // Erweitern des Datensatzes durch die Anfrageart
        var reqType = { reqType: "register" };
        var request = angular.extend(regData, reqType);

        // Absenden des Registrierungsformulars
        // Pruefen ob das Formular Valide ist
        if(form.$valid) {

            //Asynchrone Anfrage an den Server
            dataService.post(request, q)
                .then(function regSuccess(data){
                    var result = (angular.isObject(data))?data:{};
                    // Pruefen auf erfolgreiche Registrierung
                    if(result.hasOwnProperty('msg')){
                        // Ausblendung des Formulars und Einblendung eines p-Tags
                        $scope.regStatus = false;
                        // Ausgabe der Msg im p-Tag
                        $scope.msg = result.msg;

                        // Nach der Einblendung der Msg wird ein timeout von 5sec gesetzt
                        // und Weiterleitung auf das Home-Verzeichnis gesetzt
                        $timeout(function(){
                            $location.path('/');
                        } ,5000);
                    } // END IF msg

                })
        } // END IF dataService
        else {
            $scope.register_form.$setValidity('logerr', false);
            $scope.msg = 'Bitte füllen Sie alle Felder aus.';
        } // END ELSE
    }; // END addUser();

    // Eventlistener zum Abfragen, ob ein Registrierungshash uebergeben wurde
    $scope.$on('$routeChangeSuccess', function(){
        if($routeParams.regHash) {
            // ausblenden des Loginformulars
            $scope.regSuccess = true;

            // Erstellen des Request-Datensatzes
            var regHash = {"regHash" : $routeParams.regHash};
            var reqType = { reqType: "regHash" };
            var request = angular.extend(regHash, reqType);
            //Asynchrone Anfrage an den Server
            dataService.post(request, q)
                .then(function regHashSuccess(data) {
                    var result = (angular.isObject(data))?data:{};
                    // Pruefen auf erfolgreichen Abgleich der Registrierung Hashes
                    if(result.hasOwnProperty('msg')){
                        // Einblenden der Server Msg
                        $scope.msg = result.msg;
                        // Einbledung des Loginformulars und Ausblendung der Msg nach Timeout 2sec
                        $timeout(function(){
                            //$scope.msg = '';
                            $scope.regSuccess = false;
                        }, 2000)
                    }
                });
        }
    });

});