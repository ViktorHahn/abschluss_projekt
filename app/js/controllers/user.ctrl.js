app.controller('userCtrl', function ($scope, $rootScope, $location, $routeParams, $timeout, dataService) {
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'users.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Eigenschaften fuer die User
    $scope.userData = {};
    // Eigenschaften fuer Bearbeiten des Users
    $scope.edituser = {};
    $scope.edituser.mail = '';
    $scope.edituser.confmail = '';
    $scope.edituser.oldpassword = '';
    $scope.edituser.password = '';
    $scope.edituser.confpassword = '';

    // Eigenschften zur Abfrage des Loeschvorgangs
    $scope.delUser = false;
    $scope.delFlag = false;



    // Methode zum Vergleich der Values von Inputgfeldern
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

    // Methode zum Update von User Email oder Passwort
    $scope.updateUser = function(form){

        var editForm = angular.isObject(form)?form:false;

        var request = {
            reqType: "updateUserByID",
            uid : $rootScope.user.uid
        };

        // Check ob Email-Adresse geaendert worden ist
        if($scope.edituser.mail.length > 0 &&
            $scope.edituser.mail.length > 0
        ){
            //Check auf Validitaet
            if(editForm.new_email.$valid &&
                editForm.conf_email.$valid
            ){
                var mail = {
                    email : $scope.edituser.mail
                };
                angular.extend(request, mail);
            }

        }

        // Check ob Passwort geaendert worden ist
        if($scope.edituser.oldpassword.length > 0 &&
            $scope.edituser.password.length > 0 &&
            $scope.edituser.confpassword > 0
        ){
            //Check auf Validitaet
            if(editForm.oldpassword.$valid &&
                editForm.password.$valid &&
                editForm.confpassword.$valid
            ){
                var pass = {
                    password : $scope.edituser.password,
                    oldpassword : $scope.edituser.oldpassword
                };
                angular.extend(request, pass);
            }

        }
        // Abfrage ob Passwort oder Email geaendert worden sind
        if(request.hasOwnProperty('password') ||
            request.hasOwnProperty('email')
        ){
            //Asynchrone Anfrage an den Server
            dataService.put(request, q)
                .then(function successCallback(data){
                    var result = (angular.isObject(data))?data:{};

                    if(result.hasOwnProperty('msg')){
                        if(result.msg.length > 0){
                            if(result.hasOwnProperty('email')){
                                if(result.email.length > 0 )
                                    $scope.userData.email = result.email;
                            }
                            $scope.msg = result.msg;

                            $timeout(function(){
                                $scope.msg = '';
                            }, 3000)
                        }
                    }
                    // Fehlerlausgabe des Servers
                    else if (result.hasOwnProperty('errMsg')
                    ){
                        if(result.errMsg.length > 0){
                            $scope.errMsg = result.errMsg;
                            $timeout(function(){
                                $scope.errMsg = '';
                            }, 3000)
                        }
                    }
                });
        }

    };

    // Methode zum Abruf der Benutzerdaten
    $scope.getUserByID = function(){
        //Erstellen des Requests
        var request = {
            "reqType" : "getUserByID",
            "uid" : $rootScope.user.uid
        };
        //Asynchrone Anfrage an den Server
        dataService.get(request, q)
            .then(function successCallback(data){
                var result = (angular.isObject(data))?data:{};
                if(!result.hasOwnProperty('msg')){
                    $scope.userData = result;
                }
                // Fehlerlausgabe des Servers
                else if (result.hasOwnProperty('msg') &&
                    result.msg.length > 0
                ){
                    $scope.msg = result.msg;
                    // redirect auf groups
                    $timeout(function(){
                        $scope.msg = '';
                        $location.path('/');
                    }, 2500)
                }
            });
    };

    // Methode zum Loeschen des Users
    $scope.deleteUser = function () {
        $scope.delFlag = true;
        $scope.$watch('delUser', function(){
            if($scope.delUser == true &&
                ($rootScope.user.uid.length > 0 ||
                $rootScope.user.credits == 2)
            ){
                // Request vorbereiten
                var request = {
                    reqType : "deleteUserByID",
                    uid : $rootScope.user.uid
                };

                //Asynchrone Anfrage an den Server
                dataService.del(request, q)
                    .then(function successCallback(data) {
                        var result = (angular.isObject(data)) ? data : {};
                        if(result.hasOwnProperty('msg')){
                            $scope.msg = result.msg;

                            $timeout(function(){
                                $scope.msg = '';
                                $scope.delFlag = false;
                                $scope.delUser = false;
                                $scope.logout();
                            }, 5000)
                        } else if(result.hasOwnProperty('errMsg')){
                            $scope.errMsg = result.errMsg;
                            $timeout(function(){
                                $scope.errMsg = '';
                                $scope.delFlag = false;
                                $scope.delUser = false;
                            }, 5000)
                        }

                    });


            }
        })
    };

    // Eventlistener zum Sperren der Route, wenn User nicht berechtigt ist
    $scope.$on('$routeChangeSuccess', function () {
        var user = $rootScope.user.username;
        var paramUser = $routeParams.hasOwnProperty('username')?$routeParams.username:'';

        if(user == paramUser ||
            $rootScope.user.credits == 2
        ){
            $scope.getUserByID();
        }
    })

});