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
<html>
<head lang="de">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=Edge"/>
    <meta name="viewport" content="width=device-width, minimum-scale=1, maximum-scale=2">
    <link rel="stylesheet" type="text/css" href="style/style.css">
    <title>dJury - David gegen Goliath</title>
    <script type="text/javascript" charset="utf-8" src="lib/jquery-1.12.0.min.js"></script>
<!--    <script type="text/javascript" charset="utf-8" src="lib/edge.6.0.0.min.js"></script>-->

</head>
<body data-ng-app="djury" data-ng-controller="appCtrl">
    <noscript>
        <p>Es scheint, dass JavaScript deaktiviert ist.</p>
        <p>Um die Funktionen dieser Seite nutzen zu k&ouml;nnen, muss JavaScript aktiviert sein.</p>
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

    <script type="text/javascript" charset="utf-8" src="js/app.config.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/app.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/services/data.service.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/auth.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/directives/editableByUid.directive.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/directives/contenteditable.directive.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/directives/asyncUniq.directive.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/createGroup.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/groupView.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/groups.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/lawyers.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/user.ctrl.js"></script>
    <script type="text/javascript" charset="utf-8" src="js/controllers/lawyerView.ctrl.js"></script>

</body>
</html>