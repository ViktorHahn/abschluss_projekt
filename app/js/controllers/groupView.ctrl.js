// Controller zur Darstellung einer spezifischen Gruppe
app.controller('groupViewCtrl', function($scope, $rootScope, $location, $routeParams, dataService, $timeout){
    // Definieren von Eingenschaften
    // @ q : aufzurufende PHP-Datei
    var q = 'groups.handler.php';
    // Massege vom Server
    $scope.msg = '';
    // Daten fuer den GroupView
    $scope.grpEdited = false;
    $scope.postEdited = false;
    $scope.grp = {};
    $scope.posts = {};
    $scope.noPost = '';

    $scope.updatedPostFlag = false;

    // Eigenschften zur Abfrage des Loeschvorgangs von Gruppe
    $scope.delGrp = false;
    $scope.delGrpFlag = false;


    // Definieren von Methoden

    // Eventlistener zum Uebergabe der RouteParameter/GruppenID
    // laedt Gruppen-, Gengner- & GruppenDiskussions-Daten
    $scope.$on('$routeChangeSuccess', function(){
        if($routeParams.groupID){
            //Gruppen / Gengner
            //Erstellen des Requests
            var request1 = {
                "reqType" : "getGroupByID",
                "grpID" : $routeParams.groupID
            };

            //Asynchrone Anfrage an den Server
            dataService.get(request1, q)
                .then(function getGroupByID(result){
                    //Pruefen ob die richtigen Daten geliefert wurden
                    if(!result.hasOwnProperty('msg') &&
                        angular.isObject(result)
                    ){
                        $scope.grp = result;
                    }
                    // Gruppe existiert nicht
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

            // GruppenDiskussion
            // Erstellen des Requests
            var request2 = {
                "reqType" : "getPostsByGrpID",
                "grpID" : $routeParams.groupID,
                "uid" : $rootScope.user.uid
            };

            //Asynchrone Anfrage an den Server
            dataService.get(request2, q)
                .then(function getPostsByGrpID(result){
                    if(!result.hasOwnProperty('msg') &&
                        angular.isObject(result)
                    ){
                        $scope.posts = result;
                    } else {
                        $scope.noPost='Hier gibt es noch keine Posts.';
                    }
                }); // END .then

        } // END IF routeParams
    }); // END Eventlistener

    // Eventlistener zum Festzustellen ob die Gruppe bearbeitet wurde
    $scope.$watchCollection('grp', function(newValue, oldValue){
        // ist object leer? -- Listener wuerde sonst bei init feuern
        if(!angular.equals({},newValue) && !angular.equals({},oldValue)){
            // Wenn grp beatrbeitet wurde dann einblenden des Absenden-Buttons durch flag
            $scope.grpEdited = true;
        }

    });

    //

    // Update-Methode fuer die Gruppe
    $scope.updateGrp = function(){
        // Abfrage ob grpID existiert und User berechtigt ist
        if($scope.grp.grpID &&
            ($scope.grp.creatorID == $rootScope.uid ||
            $rootScope.user.credits == 2)
        ) {

            //Erstellen des Requests
            var request = {
                "reqType": "updateGroupByID",
                "grpID": $scope.grp.grpID,
                "uid": $rootScope.user.uid,
                "description" : $scope.grp.description
            };

            //Asynchrone Anfrage an den Server
            dataService.put(request, q)
                .then(function successUpdate(result) {
                    if (result.hasOwnProperty('msg')) {
                        //Ausgabe MSG
                        $scope.msg = result.msg;
                        // Timeout zur Anzeige der Nachricht
                        $timeout(function () {
                            $scope.msg = '';
                        }, 4000)
                    }
                });
        }
    };

    // Delete-Methode der Gruppe
    $scope.deleteGrp = function(){
        // Ausgabe des Confirmdeldes
        $scope.delGrpFlag = true;
        // Warten auf Confirm
        $scope.$watch('delGrp', function(){
            // Abfrage ob grpID existiert und User berechtigt ist
            if($scope.delGrp == true &&
                $scope.grp.grpID &&
                ($scope.grp.creatorID == $rootScope.uid ||
                $rootScope.user.credits == 2)
            ) {
                //Erstellen des Requests
                var request = {
                    "reqType": "deleteGroupByID",
                    "grpID": $scope.grp.grpID,
                    "uid": $rootScope.user.uid
                };

                //Asynchrone Anfrage an den Server
                dataService.put(request, q)
                    .then(function successUpdate(result) {
                        if (result.hasOwnProperty('msg')) {
                            //Ausgabe MSG
                            $scope.msg = result.msg;
                            // Timeout zur Anzeige der Nachricht
                            $timeout(function () {
                                $scope.msg = '';
                                $scope.delGrp = false;
                                $scope.delGrpFlag = false;
                            }, 4000);
                            if(result.hasOwnProperty('deleted') &&
                                result.deleted
                            ){
                                // redirect
                                $timeout(function () {
                                    $scope.delGrp = false;
                                    $scope.delGrpFlag = false;
                                    $location.path('/groups');
                                }, 4000);
                            }
                        }
                    });
            }
        });
    };

    // Neuer Beitrag vom Benutzer
    $scope.createPost = function (form, data) {
        // Pruefen ob Post valide ist
        if(form.$valid){
            // Voerbereiten des Beirags zum Weiterleiten an den Server
            var request = {"reqType" : "createPostByGrpID"};
            var newMessage = {
                "grpID" : $scope.grp.grpID,
                "uid" : $rootScope.user.uid,
                "credts" : $rootScope.user.credits,
                "username" : $rootScope.user.username,
                "message" : data
            };
            // Erweitern des Requests mit dem Benutzerbeitrag (newMessage)
            angular.extend(request, newMessage);

            //Asynchrone Anfrage an den Server
            dataService.put(request, q)
                // Wenn Antwort
                .then(function successCalback(result){
                    // Wenn die Antwort ein JSON-Objekt ist und
                    // die Eigenschaften discussionID & time besitzt
                    if(angular.isObject(result) &&
                        result.hasOwnProperty('discussionID') &&
                        result.hasOwnProperty('time')
                    ){
                        // Ergaenzen des Benutzerbeitrags mit discussionID & time
                        var extendNewMessage = {
                            "discussionID" : result.discussionID,
                            "time" : result.time
                        };
                        angular.extend(newMessage, extendNewMessage);
                        // Erweitern der Posts im Scope
                        $scope.posts.push(newMessage);
                        //angular.extend($scope.posts, newMessage);

                    } else if(result.hasOwnProperty('msg')){
                        $scope.msg = result.msg;
                        $timeout(function(){
                            // Setzt die msg zurueck
                            $scope.msg = '';

                        }, 5000)
                    }
                });// END dataService
            } // END IF from.$valid
    }; // END createPost

    // Methode setzt Flag zum einblenden des Absenden Buttons, wenn Post geaendert wurde
    $scope.update = function(postdata){
        //Einblenden Flag
        postdata.updatedFlag = true;
    };

    // Methode zum Updaten des Posts
    $scope.updatePost = function(postdata){
        var creator = postdata.userID;
        var id = postdata.discussionID;
        var message = postdata.message;
        // Abfrage ob PostID existiert und User berechtigt ist
        if( id &&
            (creator == $rootScope.user.uid ||
            $rootScope.user.credits == 2)
        ) {

            //Erstellen des Requests
            var request = {
                "reqType": "updatePostByID",
                "discussionID": id,
                "uid": $rootScope.user.uid,
                "message": message
            };

            //Asynchrone Anfrage an den Server
            dataService.put(request, q)
                .then(function successUpdate(result) {
                    if (result.hasOwnProperty('msg')) {
                        //Ausgabe MSG
                        $scope.msg = result.msg;
                        // Timeout zur Anzeige der Nachricht
                        $timeout(function () {
                            // Ausblenden der Nachricht
                            $scope.msg = '';
                            // Ausblenden des Update buttons
                            postdata.updatedFlag = false;
                        }, 4000)
                    }
                });

        }
    };

    //Methode zum Loeschen eines Posts
    $scope.deletePost = function(postdata) {

        // Anzeige des Confirmfensters
        postdata.delPostFlag = true;
        postdata.delPost = false;

        //Warten auf Confirm
        var idPost = postdata.discussionID;
        for( var i=0; i < $scope.posts.length; i++){
            if($scope.posts[i].discussionID == idPost){
                $scope.$watch('posts['+ i +']["delPost"]', function(newValue){
                    // Abfrage ob postID existiert, User berechtigt ist und der User den Loeschvorgang bestaettigt hat
                    if(newValue == true &&
                        postdata.discussionID &&
                        (postdata.userID == $rootScope.uid ||
                        $rootScope.user.credits == 2)
                    ){
                        //Erstellen des Requests
                        var request = {
                            "reqType": "deletePostByID",
                            "discussionID": postdata.discussionID,
                            "uid": $rootScope.user.uid
                        };

                        //Asynchrone Anfrage an den Server
                        dataService.del(request, q)
                            .then(function successUpdate(data) {
                                var result = angular.isObject(data)?data:{};

                                if (result.hasOwnProperty('msg')) {
                                    //Ausgabe MSG
                                    $scope.msg = result.msg;
                                    // Timeout zur Anzeige der Nachricht
                                    $timeout(function () {
                                        $scope.msg = '';
                                    }, 4000)
                                }
                                // Entfernen des Objectes in Angular
                                if(result.hasOwnProperty('deleted') &&
                                    result.deleted
                                ){
                                    angular.forEach($scope.posts, function(value, key){
                                        if(value.discussionID == idPost){
                                            $scope.posts.splice(key,1);
                                            //$scope.$apply();
                                        }
                                    });
                                }
                            });
                    }
                })

            }
        }
    };

}); // END controller