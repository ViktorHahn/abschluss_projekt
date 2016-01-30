var app = angular.module('djury',['ngRoute']);

// Setzt einen Sessiontoken für zuküftige Anfragen des
// $http-Services und wird mittels headers übertragen.
// Token wird serverseitig durch PHP beim Erstaufruf der index.php
// erzeugt. Einbindung des Tokens in JS erfolgt als Konstane ebenfalls in der index.php
app.run(['CSRF_TOKEN','$http','$rootScope', '$route', '$routeParams',function(CSRF_TOKEN, $http, $rootScope, $route, $routeParams) {
    $http.defaults.headers.common['CSRF_TOKEN'] = CSRF_TOKEN;
    $http.defaults.headers.common['Content-Type'] ='text/html; charset=UTF-8';
    $rootScope.$on('$routeChangeSuccess', function() {
        document.title = $route.current.title;
        //toDo Title ueber die routeParams fuer user und lawyer einarbeiten
    });
}]);
