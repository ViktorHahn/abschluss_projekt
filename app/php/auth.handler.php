<?php
// PHP-File zur Abwicklung von Login- und Registrierungsfuntionen
session_start();
// Einbinden der Datenbankzugriffs- und der Validierungsklasse
require_once('classes/class.db.php');
require_once('classes/class.validate.php');

if(isset($_SESSION['XSRF']) && isset($_SERVER['HTTP_X_CSRF_TOKEN'])){

    // Abgleich der Tokens
    if($_SESSION['XSRF'] === trim(strip_tags($_SERVER['HTTP_X_CSRF_TOKEN']))){

        // Zugriff auf die POST-Daten
        $data = file_get_contents("php://input");

        // Grobvalidierung der Daten

        $request = validate::trimStripJson($data);

        // Welcher Art ist die Anfrage?
        if(isset($request->reqType) && strlen($request->reqType) > 0) {

            $response = [];

            $reqType = $request->reqType;
            // Aufbau der Datenbankverbindung
            $db = db::getInstance()->getConnection();

            // Fallunterscheidung der Anfrage zwischen login, register, regHash oder uniqueUser
            switch($reqType){
                case 'login' :
                    // Pruefen ob Benutzername und Passwort gesetzt sind
                    if( isset($request->username) &&
                        strlen($request->username) > 0 &&
                        isset($request->password) &&
                        strlen($request->password) >0
                    ){

                        // Umwandeln des Passworts in ein md5-Hash
                        $password = md5($request->password.'djury');
                        // Vorbereiten der Datenbankanfrage
                        $sql= 'SELECT * FROM users WHERE (username="'.$request->username.'" OR email="'.$request->username.'") AND password="'.$password.'" AND status = 0;';

                        // Datenbankanfrage
                        $result = $db->query($sql);

                        // Prüfen ob User existiert
                        if ($result->num_rows > 0) {

                            $user = $result->fetch_object();
                            $_SESSION['username'] = $user->username;
                            $_SESSION['uid'] = $user->userID;
                            $_SESSION['credits'] = $user->credits;
                            // Generieren eines UserTokens für die Weitergabe an den Client
                            $utoken = hash('sha256', uniqid(mt_rand().$user->userID, true));
                            // Speichern der Tokens in der Session
                            $_SESSION['UTOKEN'] = $utoken;
                            // Vobereiten der Ausgaben an den Client
                            $response = [
                                "utoken" => $utoken,
                                "uid" => $user->userID,
                                "username" => $user->username,
                                "credits" => $user->credits
                            ];
                        } // END IF User existiert
                        // Error Message, wenn der Login fehlgeschlagen ist
                        else {
                            // Vobereiten der Ausgaben an den Client
                            $response = [
                                "errMsg" => "Login fehlgeschlagen. Bitte &uuml;berpr&uuml;fen Sie Ihre Eingabe."
                            ];
                        } // END User existiert
                    } //END IF isset(Benutzername & Passwort)
                    else {
                        // Vobereiten der Ausgaben an den Client
                        $response = [
                            "errMsg" => "Sie m&uuml;ssen einen Benutzernamen und Passwort angeben."
                        ];
                    } // END ELSE isset(Benutzername & Passwort)
                        break;

                case 'register':
                    $sql = '';
                    // Ueberprüfen ob Username, Passwort und Email gesetzt sind
                    if( isset($request->username) && strlen($request->username) > 0 &&
                        isset($request->password) && strlen($request->password) >0 &&
                        isset($request->email) && strlen($request->email) > 0
                    ){
                        // Umwandeln des Passworts in ein md5-Hash
                        $password = md5($request->password.'djury');

                        // Pruefen ob der Username oder Email in DB gesetzt sind
                        $uniqueUser = isset($request->username) ? $request->username : $request->email;
                        // Vorbereiten der Datenbankanfrage
                        $sql = 'SELECT * FROM users WHERE username="' . $uniqueUser . '" OR email="' . $uniqueUser . '";';
                        $result = $db->query($sql);

                        if($result->num_rows == 0 ){
                            $sql = 'INSERT INTO users SET   username =  "'.$request->username.'",
                                                            password =  "'.$password.'",
                                                            email =     "'.$request->email.'",
                                                            status =    1,
                                                            credits =   0
                                                            ;';
                            // Prueft ob ein Anwalt sich anmeldet und alle Felderangegeben sind. Ueberschreibt die erste sql
                            if( isset($request->lawyer) && $request->lawyer == true ){
                                // der folgende SQL-String wirft ein Notice aus, wenn zb. $request->title nicht gesetzt ist
                                // die Ausgabe der Notice zerstört jedoch die spaetere Ausgabe von JSON
                                // ob_start() sammelt alle PHP Warning, Notice, Error und Fatal Error
                                // und verhindert die Ausgabe
                                ob_start();
                                $sql = 'INSERT INTO users SET   username =  "'.$request->username.'",
                                                                password =  "'.$password.'",
                                                                email =     "'.$request->email.'",
                                                                status =    1,
                                                                credits =   1,
                                                                gender =    "'.$request->gender.'",
                                                                title =     "'.$request->title.'",
                                                                lastname =  "'.$request->lastname.'",
                                                                firstname = "'.$request->firstname.'",
                                                                street =    "'.$request->street.'",
                                                                housenr =   "'.$request->housenr.'",
                                                                domicile =  "'.$request->domicile.'",
                                                                zip =       "'.$request->zip.'",
                                                                phone =     "'.$request->phone.'",
                                                                office =    "'.$request->office.'"
                                                                ;';
                            } // END 3rd IF
                        } // END 2nd IF

                        // Uebergabe SQL an DB
                        $db->query($sql);
                        // Loescht alle Meldungen von PHP
                        ob_end_clean();

                        //Pruefen ob der Eintrag in die DB erfolgreich war
                        // Erzeugen eines Hash-Wertes zum Versand an die angegebene Emailadresse zur Verifizierung
                        if($db->affected_rows > 0){
                            // Erzeugen eines Hash-Wertes zum Bestaettigen der Email
                            $userID = $db->insert_id;
                            $regHash = md5($userID.mt_rand());
                            $sql = 'UPDATE users SET regHash = "'.$regHash.'" WHERE userID = "'.$userID.'" LIMIT 1;';
                            $db->query($sql);

                            // Abschicken und Ueberpruefen ob der DB-Eintrag erfolgreich war
                            // Versand des Registrierungslinks
                            if($db->affected_rows > 0){
                                // Vorbereiten der Email
                                $to = $request->email;
                                $subject = 'Schliessen Sie Ihre Anmeldung bei dJury ab.';
                                $msg = 'Best&auml;tigen Sie Ihre Registrierung bei dJury durch Anklicken dieses Links: \n
                                        https://http://localhost:63342/djury/app/index.php#/registrieren/'.$regHash.' \n
                                        ab.';
                                $headers = 'From: noreply@djury.de';

                                // Versand der Email
                                mail($to, $subject, $msg, $headers);

                                // Generieren einer Nachricht an den Client
                                $response = [
                                    "msg" => "Ihre Anmeldung ist fast abgeschlossen. Zur Best&auml;tigung Ihrer Emailadresse ist Ihnen ein Aktivierungslink zugesendet worden."
                                ];

                            } // END IF MAIL-Versand
                        } // END IF HASH-Wert
                    }// END IF
                    else {
                        $response = [
                            "msg" => "Registierung ist fehlgeschlagen. Bitte versuchen Sie es erneut oder Kontaktieren Sie uns."
                        ];
                    }
                    break;

                case 'regHash':

                    // Pruefen ob der uebergebene regHash einen Wert besitzt
                    if(strlen($request->regHash)>0){

                        $regHash = $request->regHash;
                        // Vorbereiten der SQL
                        // setzt den UserStatus 1 = aktiv
                        $sql = 'UPDATE users SET status = 0 WHERE regHash = "'.$regHash.'" LIMIT 1;';
                        // DB Anfrage
                        $db->query($sql);

                        // Ueberpruefung ob dieser Hash-Wert in der Datenbank einem User zugewiesen ist.
                        if($db->affected_rows > 0){
                            // Vorbereiten des Response
                            $response = [
                                "msg" => "Ihre Registrierung ist abgeschlossen. Bitte loggen Sie sich ein."
                            ];
                        } // END IF affected_rows
                    } // END IF regHash -> Wert
                    break;

                case 'uniqueUser':
                    // Pruefen ob Benutzername oder Email in der DB gesetzt sind
                    if(isset($request->username) && strlen($request->username) > 0 ||
                        isset($request->email) && strlen($request->email) > 0
                    ){
                        $uniqueUser = isset($request->username) ? $request->username : $request->email;
                        // Vorbereiten der Datenbankanfrage
                        $sql = 'SELECT * FROM users WHERE username="' . $uniqueUser . '" OR email="' . $uniqueUser . '";';

                        // Datenbankanfrage
                        $result = $db->query($sql);

                        // @return  AngularJS erwartet einen StatusCode als Antwort
                        $numRows = mysqli_num_rows($result);
                        if ($result->num_rows > 0) {
                            // Value ist bereits vergeben 406 = Not Acceptable
                            http_response_code(406);
                        }
                        else {
                            // Value ist unique 200 = ok
                            http_response_code(200);
                        }
                    }
                    break;

                case 'logout' :
                    // Loeschen der Session-Cookies
                    if (isset($_COOKIE['PHPSESSID'])) {
                        // PHP
                        unset($_COOKIE['PHPSESSID']);
                        // Client-Cookie
                        setcookie('PHPSESSID', '', time() - 3600, '/');
                    }
                    // Schliessen der Session
                    session_destroy();
                    break;
            } // END SWITCH

        } // END IF Welcher Art ist die Anfrage?
        else {
            $response = [
                "errMsg" => "Anfrage fehlgeschlagen. Bitte versuchen Sie es erneut."
            ];

        } // END ELSE Welcher Art ist die Anfrage?
        // Ausgabe der Antwort an den Client
        if(!empty($response)){
            echo json_encode($response);
        }
    } // END IF Abgleich der Tokens
}; // END IF isset TOKENS