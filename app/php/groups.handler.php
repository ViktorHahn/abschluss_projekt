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

                case 'createGroup' :
                    // Pruefen ob user schon eingelogt ist
                    if(isset($_SESSION['uid']) &&
                        isset($request->uid) &&
                        $_SESSION['uid'] == $request->uid) {

                        // Pruefung alle Angaben vorhanden sind
                        if (isset($request->name) && strlen($request->name) > 0 &&
                            isset($request->description) && strlen($request->description) > 0 &&
                            isset($request->counterParty) && strlen($request->counterParty) > 0 &&
                            isset($request->businessform) && strlen($request->businessform) > 0 &&
                            isset($request->street) && strlen($request->street) > 0 &&
                            isset($request->housenr) && strlen($request->housenr) > 0 &&
                            isset($request->domicile) && strlen($request->domicile) > 0 &&
                            isset($request->zip) && strlen($request->zip) > 0 &&
                            isset($request->tags) && strlen($request->tags) > 0
                        ) {

                            // Vorbereiten der Datenbankanfrage

                            // Gegenpartei
                            // Pruefen ob die Gegenpartei in DB vorhanden ist
                            $sql = 'SELECT counterID FROM counterparty WHERE cname="'.$request->counterParty.'" AND zip="'.$request->zip.'"';
                            $result = $db->query($sql);
                            $r1 = is_object($result)?$result->num_rows:0;
                            // Streitgruppe
                            // Pruefen ob der Streitgruppenname in DB vorhanden ist
                            $sql2 = 'SELECT * FROM groups WHERE name="'.$request->name.'"';
                            $result2 = $db->query($sql2);
                            $r2 = is_object($result2)?$result2->num_rows:0;

                            // Wenn Gruppenname nicht vergeben ist
                            if($r2 == false){
                                // Wenn der Gegner existiert, nimm seine id
                                if($r1 > 0){
                                    $data = $result->fetch_object();
                                    $counterID = $data->counterID;
                                }
                                // Wenn der Gegner nicht existiert, Eintrag in die DB, dann nimm id
                                else {
                                    $sql = 'INSERT INTO counterparty SET cname = "'.$request->counterParty.'",
                                                                businessform = "'.$request->businessform.'",
                                                                street = "'.$request->street.'",
                                                                housenr = "'.$request->housenr.'",
                                                                domicile = "'.$request->domicile.'",
                                                                zip = "'.$request->zip.'";';
                                    $db->query($sql);
                                    $counterID = $db->insert_id;
                                }
                                // Eintrag der Gruppe in die DB
                                $timestamp = time();
                                // SQL
                                $sql = 'INSERT INTO groups SET name = "'.$request->name.'",
                                                            description = "'.$request->description.'",
                                                            tag = "'.$request->tags.'",
                                                            counterID = "'.$counterID.'",
                                                            timestamp = "'.$timestamp.'",
                                                            creatorID = "'.$_SESSION['uid'].'",
                                                            creator = "'.$_SESSION['username'].'";';
                                $result3 = $db->query($sql);

                                // Pruefen ob Eintrag erfolgreich war
                                if ($db->affected_rows > 0 && $counterID > 0) {
                                    $grpID = $db->insert_id;
                                    $response = [
                                        "msg" => "Sie haben erfolgreich eine neue Streitgruppe erstellt.",
                                        "grpID" => $grpID
                                    ];
                                }
                            }
                            // Gruppenname ist vergeben
                            else {
                                $response = [
                                    "msg" => "Der gew&auml;hlte Streitgruppenname ist bereits vergeben. Bitte w&auml;hlen Sie einen Neuen aus."
                                ];
                            }
                        }// END IF
                    }// END IF user logged in
                    break;

                case 'getGroupByID':
                    // Pruefen ob grpID nicht leer ist
                    if(isset($request->grpID)){
                        // Vorbereiten der Datenbankanfrage
                        $sql = 'SELECT * FROM groups
                                INNER JOIN counterparty
                                ON groups.counterID = counterparty.counterID
                                WHERE groups.grpID = "'.$request->grpID.'" AND status = 0;';
                        // Durchfuehren der Anfrage
                        $result = $db->query($sql);
                        $r = is_object($result)?$result->num_rows:0;

                        // Pruefen ob eine Gruppe unter der verwendeten ID existiert
                        if($r > 0){
                            $data = $result->fetch_object();
                            $response = $data;
                        }
                        // Ausgabe, dass Gruppen nicht existent ist
                        else {
                            $response = [
                                "msg" => "Die von Ihnen gesuchte Streitgruppe existiert nicht."
                            ];
                        }
                    }
                    break;

                case 'updateGroupByID':

                    // Pruefen ob user schon eingelogt ist
                    if(isset($_SESSION['uid']) &&
                        isset($request->uid) &&
                        ($_SESSION['uid'] == $request->uid ||
                        $_SESSION['credits'] == 2)
                    ) {

                        // Pruefung alle Angaben vorhanden sind
                        if (isset($request->grpID) && strlen($request->grpID) > 0 &&
                            isset($request->description) && strlen($request->description) > 0
                        ) {
                            // Update der Gruppe in der DB
                            // SQL
                            $sql = 'UPDATE groups SET description = "'.$request->description.'"
                                                      WHERE grpID = "'.$request->grpID.'"
                                                      LIMIT 1;';
                                $db->query($sql);
                                // Pruefen ob das Update erfolgreich war
                                if ($db->affected_rows > 0 && $counterID > 0) {
                                    $response = [
                                        "msg" => "Die Änderugen der Streitgruppe waren erfolgreich."
                                    ];
                                }
                        }
                    } ELSE {
                        $response = [
                            "msg" => "Sie sind nicht angemeldet. Änderungen wurden nicht durchgeführt."
                        ];
                    }
                    break;

                case 'deleteGroupByID':
                    // Pruefen ob user schon eingelogt ist oder Admin ist
                    if(isset($_SESSION['uid']) &&
                        isset($request->uid) &&
                        ($_SESSION['uid'] == $request->uid ||
                            $_SESSION['credits'] == 2)
                    ) {
                        // Pruefen ob user berechtigt ist zum loeschen - select creator
                        if(isset($request->grpID)){
                            // SQL
                            $sql = 'SELECT creatorID FROM groups WHERE grpID="'.$request->grpID.'";';
                            $result = $db->query($sql);
                            $r = is_object($result)?$result->num_rows:0;
                            $creator = ($r > 0)?$result->fetch_object():false;

                            // Pruefen ob Erseller der Gruppe dem eingeloggten User entspricht oder Admin ist
                            if($request->uid == $creator ||
                                $_SESSION['credits'] == 2){
                                // SQL
                                $sql = 'UPDATE groups SET status = 1
                                                      WHERE grpID = "'.$request->grpID.'"
                                                      LIMIT 1;';
                                $db->query($sql);
                                //Pruefen ob update erfolgreich war
                                if($db->affected_rows > 0){
                                    $response =[
                                        "msg" => "Die Streitgruppe ist auf den Status 'Inaktiv' gesetzt worden.",
                                        "deleted" => true

                                    ];
                                }
                                else {
                                    $response =[
                                        "msg" => "Die Streitgruppe konnte nicht gelöscht werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns.",
                                        "deleted" => false
                                    ];
                                }

                            } // END IF User == Creator
                            else {
                                $response = [
                                    "msg" => "Sie sind nicht berechtigt diese Streitgruppe zu löschen.",
                                    "deleted" => false
                                ];
                            }
                        } // END IF select creator

                    } // END IF user-auth
                    else {
                        $response = [
                            "msg" => "Bitte loggen Sie sich ein."
                        ];
                    }

                    break;

                case 'getPostsByGrpID':

                    // Pruefen ob grpID nicht leer ist
                    if(isset($request->grpID) &&
                        isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        ($request->uid == $_SESSION['uid'] ||
                        $_SESSION['credits'] == 2)
                    ){
                        // Vorbereiten der Datenbankanfrage
                        $sql = 'SELECT * FROM groupdiscussion
                                WHERE grpID = "'.$request->grpID.'" AND status = 0;';
                        // Durchfuehren der Anfrage
                        $result = $db->query($sql);
                        $r = $result->num_rows;

                        // Pruefen ob Posts unter der verwendeten ID existieren
                        if($r > 0){
                            $data = [];
                            while($obj = $result->fetch_object()){
                                $data[] = $obj;
                            }
                            $response = $data;
                        }
                    }

                    break;

                case 'updatePostByID':

                    // Pruefen ob discussionID, message nicht leer und User berechtigt ist
                    if(isset($request->discussionID) &&
                        isset($request->message) &&
                        isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        ($request->uid == $_SESSION['uid'] ||
                            $_SESSION['credits'] == 2)
                    ){
                        // SQL
                        $sql = 'UPDATE groupdiscussion SET message = "'.$request->message.'"
                                                        WHERE discussionID = "'.$request->discussionID.'"
                                                        LIMIT 1';
                        $db->query($sql);

                        if($db->affected_rows > 0){
                            $response = [
                                "msg" => "Ihr Beitrag wurde erfolgreich geändert."
                            ];
                        } else {
                            $response = [
                                "msg" => "Ihr Beitrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                            ];
                        }
                    }// END IF User-Auth

                    break;

                case 'deletePostByID' :

                    // Pruefen ob discussionID nicht leer und User berechtigt ist
                    if(isset($request->discussionID) &&
                        isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        $request->uid == $_SESSION['uid']
                    ){
                        // Ueberpuefen ob user der Ersteller des Beitrags oder Admin ist
                        // SQL
                        $sql = 'SELECT userID FROM groupdiscussion WHERE discussionID = "'.$request->discussionID.'"';
                        $result = $db->query($sql);
                        $creator = is_object($result)?$result->fetch_object():false;

                        if($creator == $request->uid ||
                            $_SESSION['credits'] == 2
                        ){
                            // SQL
                            $sql = 'UPDATE groupdiscussion SET status = 1
                                                            WHERE discussionID = "'.$request->discussionID.'"
                                                            LIMIT 1';
                            $db->query($sql);

                            if($db->affected_rows > 0){
                                $response = [
                                    "msg" => "Ihr Beitrag wurde erfolgreich gelöscht.",
                                    "deleted" => true
                                ];
                            } else {
                                $response = [
                                    "msg" => "Ihr Beitrag konnte nicht gelöscht werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                                ];
                            }
                        }
                    }

                    break;

                case 'createPostByGrpID':

                    // Pruefen ob user schon eingelogt ist
                    if(isset($request->uid) &&
                        $_SESSION['uid'] == $request->uid) {

                        // Pruefen ob erforderliche Daten vorliegen
                        if(isset($request->grpID) &&
                            isset($request->username) &&
                            isset($request->message)
                        ){
                            $timestamp = time();

                            // SQL
                            $sql = 'INSERT INTO groupdiscussion SET grpID = "'.$request->grpID.'",
                                                                    userID = "'.$request->uid.'",
                                                                    username = "'.$request->username.'",
                                                                    message = "'.$request->message.'",
                                                                    time = "'.$timestamp.'";
                            ';
                            // Senden der SQL
                            $db->query($sql);
                        } // END IF alle Daten vorhanden
                        // Vorbereiten der Antwort, wenn Eintrag erfolgreich
                        if($db->affected_rows > 0){
                            $discussionID = $db->insert_id;
                            $response = [
                                "discussionID" => $discussionID,
                                "time" => $timestamp
                            ];
                        } // Beitrag konnte nicht gespeichert werden
                        else {
                            $response = [
                                "msg" => "Ihr Beitrag konnte nicht gespeichert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                            ];
                        }
                    } // END IF User eingelogt
                    break;

                case 'getGroups':

                    // Allgemeine Suchanfage der Gruppen
                    // SQL
                    $sqlBeginn = 'SELECT *';

                    $sqlEnd = ' FROM groups INNER JOIN counterparty ON groups.counterID = counterparty.counterID';

                    // Spezifische Suchanfrage mit Suchbegriff und/oder Tag

                    // Initialisieren von SQL-Variablen die leer sein koennen
                    $tagSQL = null;
                    $tagSQLast = null;
                    $extSql = null;

                    // Ueberpruefen ob Suchbegriff gesetzt ist
                    if(isset($request->srchTerm) &&
                        strlen($request->srchTerm) > 0
                    ){

                        // Gibt es mehrere Suchbegriffe?
                        $srchTerms = explode(' ', $request->srchTerm);

                        // Vorbereiten der SQL's fuer die Suchbegriffe
                        foreach($srchTerms as $value){
                            $termsSqlDescription = 'groups.description LIKE "%'.$value.'%" OR';
                            $termsSqlName = 'groups.name LIKE "%'.$value.'%" OR';
                            $termsSqlCName = 'counterparty.cname LIKE "%'.$value.'%" OR';
                            $termsSqlDomicil = 'counterparty.domicile LIKE "%'.$value.'%" OR';
                        }

                        // Trimmen der Vorbereitete SQL's fuer die Suchbegriffe
                        $termsSqlDescription = trim($termsSqlDescription,' OR');
                        $termsSqlName = trim($termsSqlName,' OR');
                        $termsSqlCName = trim($termsSqlCName,' OR');
                        $termsSqlDomicil = trim($termsSqlDomicil,' OR');



                        // Ueberpruefen ob Tag gesetzt ist
                        if(isset($request->tag) &&
                            strlen($request->tag) > 0
                        ){
                            // Erstellen von Tag-SQL's
                            $tagSQL = 'groups.tag Like "%'.$request->tag.'%" AND';
                            $tagSQLast = 'WHEN groups.tag Like "%'.$request->tag.'%" THEN 1';
                        } // END IF isset Tag

                        // Priorisierung der ausgegeben Treffer innerhalb der SQL nach Tag und Suchbegriff
                        $extSql =', CASE
                                        WHEN '.(isset($tagSQL)?$tagSQL:'').' ('.$termsSqlDescription.') AND ('.$termsSqlName.') THEN 3
                                        WHEN '.(isset($tagSQL)?$tagSQL:'').' ('.$termsSqlDescription.') THEN 2
                                        '.(isset($tagSQLast)?$tagSQLast:'').'
                                        ELSE ""
                                    END AS "priority",
                                    CASE
                                        WHEN ('.$termsSqlCName.') AND ('.$termsSqlDomicil.') THEN 3
                                        WHEN ('.$termsSqlCName.') THEN 2
                                        WHEN ('.$termsSqlDomicil.') THEN 1
                                        ELSE ""
                                    END AS "cpriority"';
                        // WHERE Bedingung
                        $sqlWhere = ' WHERE groups.status = 0
                                        AND (('.$termsSqlCName.')
                                        OR ('.$termsSqlDomicil.')
                                        OR ('.$termsSqlDescription.')
                                        OR ('.$termsSqlName.')
                                        '.(trim(isset($tagSQL)?'OR '.$tagSQL:'', ' AND')).')';


                    }// END IF isset srchTerm

                    // Nur aktive Gruppen waehlen
                    $sqlWhereShort = ' WHERE groups.status = 0';
                    // Abschluss der SQL



                    // Sortierung
                    $sqlOrder = ' ORDER BY priority DESC, cpriority DESC';

                    // Limitierung
                    $sqlLimit = ' LIMIT 10;';

                    // Erstellen der gesamten SQL
                    $sqlSum = $sqlBeginn.(isset($extSql)?$extSql:'').$sqlEnd.(isset($extSql)?$sqlWhere:$sqlWhereShort).(isset($extSql)?$sqlOrder:'').$sqlLimit;
                    //die($sqlSum);
                    // Abschicken der SQL
                    $result = $db->query($sqlSum);

                    // Wieviele Treffer gab es?
                    $r = is_object($result)?$result->num_rows:0;

                    // Else Antwort des Servers, wenn DB-Anbfrage nicht erfolgreich

                    $response =[
                        "msg" => "Ihre Suchanfrage ergab leider keine Treffer."
                    ];
                    // Wenn Treffer nicht leer, Ausgabe der Treffer
                    if($r > 0){
                        $data=[];
                        while($obj = $result->fetch_object()){
                            $data[]=$obj;
                        }    
                        $response = $data;
                    }
                    break;


            }// END SWITCH
        }// END IF Welcher Art ist die Anfrage?


        // Ausgabe der Serverantwort
        if(!empty($response)){
            echo json_encode($response);
        }

    } // END IF Abgleich der Tokens
}; // END IF isset TOKENS