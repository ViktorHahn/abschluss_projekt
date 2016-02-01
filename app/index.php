<?php
session_start();
//Prüfen ob ein Sessiontoken bereits gesetzt ist
if(!isset($_SESSION['XSRF'])){
    // Erzeugung eines Sessiontokens
    $token = hash('sha256', uniqid(mt_rand(), true));
    $_SESSION['XSRF']=$token;
};
?>
<!DOCTYPE html>
<html data-ng-app="djury" data-ng-controller="appCtrl">
<head lang="de">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=2">
    <link rel="stylesheet" type="text/css" href="style/style.css">
    <title>djury - Davids gegen Goliath</title>
</head>
<body>
    <noscript>
        <p>Es scheint, dass JavaScript deaktiviert ist.</p>
        <p>Um die Funktionen dieser Seite nutzen zu können, muss JavaScript aktiviert sein.</p>
    </noscript>
    <header>
        <!-- header-Template wird eingebunden-->
        <div data-ng-include="'header/header.tpl.html'"></div>
    </header>

    <main>
        <!-- Viewport fuer den Maincontent -->
        <div data-ng-view></div>
    </main>

    <footer>

    </footer>

    <!-- Script Lib-->
    <script src="lib/angular.js"></script>
    <script src="lib/angular-route.js"></script>

    <!-- Scripts -->
    <script src="app.js"></script>
    <!-- Einbingung des Sessiontokens in die Angularanwendung, s.a. app.js-->
    <script>angular.module("djury").constant("CSRF_TOKEN", '<?=$_SESSION['XSRF'];?>');</script>

    <script src="js/app.config.js"></script>
    <script src="js/controllers/app.ctrl.js"></script>
    <script src="js/services/data.service.js"></script>
    <script src="js/controllers/auth.ctrl.js"></script>
    <script src="js/directives/editableByUid.directive.js"></script>
    <script src="js/directives/contenteditable.directive.js"></script>
    <script src="js/directives/asyncUniq.directive.js"></script>
    <script src="js/controllers/createGroup.ctrl.js"></script>
    <script src="js/controllers/groupView.ctrl.js"></script>
    <script src="js/controllers/groups.ctrl.js"></script>
    <script src="js/controllers/lawyers.ctrl.js"></script>
    <script src="js/controllers/user.ctrl.js"></script>
    <script src="js/controllers/lawyerView.ctrl.js"></script>
</body>
</html>