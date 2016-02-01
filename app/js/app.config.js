app.config(['$routeProvider', function ($routeProvider, $routeParams) {
    $routeProvider
        .when('/',{
            title: 'Willkommen bei dJury',
            access: {allowAnonymous : true}
        })
        .when('/login',{
            title: 'Login',
            templateUrl: 'main/login.tpl.html',
            controller: 'authCtrl',
            access: {allowAnonymous : true}
        })
        .when('/login/:regHash',{
            title: 'dJury - Registrierung abschließen',
            templateUrl: 'main/login.tpl.html',
            controller: 'authCtrl',
            access: {allowAnonymous : true}
        })
        .when('/registrieren',{
            title: 'dJury - Registrieren',
            templateUrl: 'main/register.tpl.html',
            controller: 'authCtrl',
            access: {allowAnonymous : true}
        })
        .when('/user/:username',{
            title: '',
            templateUrl: 'main/user.tpl.html',
            access: {allowAnonymous : false },
            controller: 'userCtrl'
        })
        .when('/groups', {
            title: 'dJury - Streitgruppen',
            templateUrl: 'main/groups.tpl.html',
            controller: 'groupsCtrl',
            access: {allowAnonymous : true}
        })
        .when('/groups/:term', {
            title: 'dJury - Streitgruppen',
            templateUrl: 'main/groups.tpl.html',
            controller: 'groupsCtrl',
            access: {allowAnonymous : true}
        })
        .when('/groups/:term/:tag', {
            title: 'dJury - Streitgruppen',
            templateUrl: 'main/groups.tpl.html',
            controller: 'groupsCtrl',
            access: {allowAnonymous : true}
        })
        .when('/group/:groupID',{
            title: 'dJury - groupName',
            templateUrl: 'main/groupView.tpl.html',
            controller: 'groupViewCtrl',
            access: {allowAnonymous : true}
        })
        .when('/lawyers', {
            title: 'dJury - Anwälte',
            templateUrl: 'main/lawyers.tpl.html',
            controller: 'lawyersCtrl',
            access: {allowAnonymous : true}
        })
        .when('/lawyer/:lawyerName/:lawyerID', {
            title: '',
            templateUrl: 'main/lawyerView.tpl.html',
            controller: 'lawyerViewCtrl',
            access: {allowAnonymous : true}
        })
        .when('/createGroup', {
            title: 'Erstelle eine neue Streitgruppe',
            templateUrl: 'main/createGroup.tpl.html',
            controller: 'createGroupCtrl',
            access: {allowAnonymous : false}
        })
        .when('/impressum', {
            title: 'Impressum',
            templateUrl: 'main/impressum.tpl.html',
            access: {allowAnonymous : false}
        })
        .otherwise({
            redirectTo: '/'
        })
}]);