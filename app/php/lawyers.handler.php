<?php
// PHP-File zur Abwicklung aller Gruppenfunktionen
session_start();
// Einbinden der Datenbankzugriffs- und der Validierungsklasse
require_once('classes/class.db.php');
require_once('classes/class.validate.php');

if(isset($_SESSION['XSRF']) && isset($_SERVER['HTTP_X_CSRF_TOKEN'])) {

    // Abgleich der Tokens
    if ($_SESSION['XSRF'] === trim(strip_tags($_SERVER['HTTP_X_CSRF_TOKEN']))) {

        $response = [];
        $counterID = null;
        $timestamp = null;

        // Zugriff auf die POST-Daten
        $data = file_get_contents("php://input");

        // Aufbau der Datenbankverbindung
        $db = db::getInstance()->getConnection();

        // Grobvalidierung der Daten

        $request = validate::trimStripJson($data);

        // Welcher Art ist die Anfrage?
        if (isset($request->reqType) && strlen($request->reqType) > 0) {

            $reqType = $request->reqType;

            // Aufbau der Datenbankverbindung
            $db = db::getInstance()->getConnection();

            // Fallunterscheidung der Anfrage zwischen login, register, regHash oder uniqueUser

            switch ($reqType) {

                case 'getLawyers' :

                    // Allgemeine Suchanfage der Gruppen
                    // SQL
                    $sqlBeginn = 'SELECT  userID, gender, lastname, firstname, zip, domicile, lawyerTag';

                    $sqlEnd = ' FROM users';


                    // Initialisieren von SQL-Variablen die leer sein koennen
                    $tagSQL = null;
                    $tagSQLast = null;
                    $extSql = null;
                    $termsSqlName = null;
                    $termsSqlDomicile = null;

                    // Ueberpruefen ob Suchbegriff gesetzt ist
                    if(isset($request->lsrchTerm) &&
                        strlen($request->lsrchTerm) > 0
                    ){
                        // Gibt es mehrere Suchbegriffe?
                        $srchTerms = explode(' ', $request->lsrchTerm);

                        // Vorbereiten der SQL's fuer die Suchbegriffe
                        foreach($srchTerms as $value){
                            if($value != ''){
                                $termsSqlName .= 'lastname LIKE "%'.$value.'%" OR ';
                                $termsSqlDomicile .= 'domicile LIKE "%'.$value.'%" OR ';
                            }

                        }
                        // Trimmen der Vorbereitete SQL's fuer die Suchbegriffe
                        $termsSqlName = trim($termsSqlName,' OR ');
                        $termsSqlDomicile = trim($termsSqlDomicile,' OR ');


                        // Ueberpruefen ob Tag gesetzt ist
                        if(isset($request->ltag) &&
                            strlen($request->ltag) > 0
                        ){
                            // Erstellen von Tag-SQL's
                            $tagSQL = 'lawyerTag Like "%'.$request->ltag.'%" AND';
                            $tagSQLast = 'WHEN lawyerTag Like "%'.$request->ltag.'%" THEN 1';
                        } // END IF isset Tag

                        // Priorisierung der ausgegeben Treffer innerhalb der SQL nach Tag und Suchbegriff
                        $extSql =', CASE
                                            WHEN '.(isset($tagSQL)?$tagSQL:'').' ('.$termsSqlDomicile.') AND ('.$termsSqlName.') THEN 4
                                            WHEN '.(isset($tagSQL)?$tagSQL:'').' ('.$termsSqlName.') THEN 3
                                            WHEN '.(isset($tagSQL)?$tagSQL:'').' ('.$termsSqlDomicile.') THEN 2
                                            '.(isset($tagSQLast)?$tagSQLast:'').'
                                            ELSE ""
                                        END AS "priority"
                                        ';
                    } // END IF searchTerm

                    // Abschluss der SQL
                    // WHERE Bedingung
                    $sqlWhere = ' WHERE usertype = 2
                                            AND status = 0
                                            ';

                    // Sortierung
                    $sqlOrder = ' ORDER BY priority DESC, lastname ASC';

                    // Limitierung
                    $sqlLimit = ' LIMIT 10;';


                    // Erstellen der gesamten SQL
                    $sqlSum = $sqlBeginn.(isset($extSql)?$extSql:'').$sqlEnd.$sqlWhere.(isset($extSql)?$sqlOrder:'').$sqlLimit;



//                    // SQL
//                    $sql = 'SELECT userID, gender, lastname, firstname, zip, domicile, lawyerTag
//                              FROM users
//                              WHERE usertype = 2 AND status = 0 LIMIT 10';


                    $result = $db->query($sqlSum);
                    $r = is_object($result)?$result->num_rows:0;

                    // Gab es Treffer?
                    if($r > 0){
                        $data = [];
                        while($obj = $result->fetch_object()){
                            $data[]=$obj;
                        }
                        $response = $data;

                    } else {
                        $response = [
                            "msg" => "Ihre Anfrage konnte nicht beantwortet werden"
                        ];
                    }

                    break;

                case 'getLawyerByID' :

                    if(isset($request->lawyerID) &&
                        isset($request->lawyerName)
                    ){

                        // SQL
                        $sql = 'SELECT userID, lastname, firstname, street, housenr, domicile, zip, phone, office, title, gender, email, lawyerTag
                                  FROM users
                                  WHERE usertype = 2 AND
                                        userID = "'.$request->lawyerID.'" AND
                                        lastname = "'.$request->lawyerName.'" AND
                                        status = 0 ;';
                        $result = $db->query($sql);
                        $r = is_object($result)?$result->num_rows:false;

                        if($r){
                            $response = $result->fetch_object();
                        } // END IF db-Antowrt leer
                        else {
                            $response = [
                                "msg" => "Der von Ihnen gesuchte Anwalt oder Anwältin konnte nicht gefunden werden."
                            ];
                        }
                    } // END IF isset
                    else {
                        $response = [
                            "errMsg" => "Für die Bearbeitung dieser Anfrage werden Nachname und ID des Anwalts oder der Anwältin benötigt."
                        ];
                    }

                    break;

                case 'updateLawyerByID' :

                    // Pruefen ob user schon eingelogt und berechtigt ist
                    if(isset($_SESSION['uid']) &&
                        isset($request->uid) &&
                        ($_SESSION['uid'] == $request->uid ||
                            $_SESSION['credits'] == 2)
                    ) {
                        $domicile = isset($request->domicile)?$request->domicile:'';;
                        $firstname = isset($request->firstname)?$request->firstname:'';
                        $gender = isset($request->gender)?$request->gender:'';
                        $street = isset($request->street)?$request->street:'';
                        $housenr = isset($request->housenr)?$request->housenr:'';
                        $lastname = isset($request->lastname)?$request->lastname:'';
                        $office = isset($request->office)?$request->office:'';
                        $phone = isset($request->phone)?$request->phone:'';
                        $title = isset($request->title)?$request->title:'';
                        $zip = isset($request->zip)?$request->zip:'';



                        //SQL
                        $sql = 'UPDATE users SET domicile = "'.$domicile.'",
                                                 firstname = "'.$firstname.'",
                                                 gender = "'.$gender.'",
                                                 housenr = "'.$housenr.'",
                                                 street = "'.$street.'",
                                                 lastname = "'.$lastname.'",
                                                 office = "'.$office.'",
                                                 title = "'.$title.'",
                                                 zip = "'.$zip.'",
                                                 phone = "'.$phone.'"
                                                 WHERE userID = "'.$request->userID.'"
                                                 LIMIT 1;';
                        $db->query($sql);

                        if($db->affected_rows > 0){
                            $response = [
                                "msg" => "Die Änderungen wurden gespeichert."
                            ];
                        } else {
                            $response = [
                                "msg" => "Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                            ];
                        }
                    } else {
                        $response = [
                            "msg" => "Sie besitzen nicht die notwendigen Rechte um den Vorgang abzuschließen."
                        ];
                    }





                    break;

                case 'deleteLawyerByID' :

                    // Pruefen ob user schon eingelogt ist oder Admin ist
                    if(isset($_SESSION['uid']) &&
                        isset($request->uid, $request->userID) &&
                        ($_SESSION['uid'] == $request->userID ||
                            $_SESSION['credits'] == 2)
                    ) {
                        //SQL
                        $sql = 'UPDATE users SET status = 1
                                             WHERE userID = "'.$request->userID.'"
                                             LIMIT 1;';

                        $db->query($sql);
                        if($db->affected_rows > 0){
                            $response =[
                                "msg" => "Ihr Profil ist auf den Status 'Inaktiv' gesetzt worden.",
                                "deleted" => true

                            ];

                        } else {
                            $response =[
                                "msg" => "Ihr Profil konnte nicht gelöscht werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
                                "deleted" => false
                            ];
                        }
                    } else {
                        $response = [
                            "msg" => "Sie besitzen nicht die notwendigen Rechte um den Vorgang abzuschließen."
                        ];
                    }
                    break;


            };
        }// END SWITCH
        // Ausgabe der Serverantwort
        if(!empty($response)){
            echo json_encode($response);
        };
    }//END IF Anfrageart
};// END Controller