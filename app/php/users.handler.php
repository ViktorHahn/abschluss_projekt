<?php
// PHP-File zur Abwicklung aller Userfunktionen
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

            switch($reqType){
                case 'getUserByID':
                    if(isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        ($request->uid == $_SESSION['uid'] ||
                        $_SESSION['credits'] == 2)
                    ){
                        //SQL
                        $sql = 'SELECT username, email FROM users WHERE userID = "'.$request->uid.'" AND
                                                                        status = 0;';
                        $result = $db->query($sql);
                        $r = is_object($result)?$result->num_rows:false;
                        if($r){
                            $response = $result->fetch_object();
                        } else {
                            $response = [
                                "msg" => "Ihre Anfrage konnte leider nicht bearbeitet werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                            ];
                        }

                    } else {
                        $response = [
                            "msg" => "Bitte Loggen Sie sich ein."
                        ];
                    }


                    break;

                case 'updateUserByID':

                    if(isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        ($request->uid == $_SESSION['uid'] ||
                            $_SESSION['credits'] == 2)
                    ){
                        // Abfrage ob Passwort oder Email gesetzt is
                        if(isset($request->password) &&
                            isset($request->oldpassword) ||
                            isset($request->email)
                        ){
                            // Passwort Handling
                            $oldPassword = isset($request->oldpassword)?md5($request->oldpassword.'djury'):false;
                            $newPassword = isset($request->password)?md5($request->password.'djury'):false;

                            $r = false;
                            // Ckeck oldpassword
                            if($oldPassword){
                                $sqlOldPass = 'SELECT * FROM users WHERE userID = "'.$request->uid.'" AND
                                                                     password = "'.$oldPassword.'"';

                                $result = $db->query($sqlOldPass);
                                $r = is_object($result)?$result->num_rows:false;
                            }


                            // Email Handling
                            $email = isset($request->email)?$request->email:false;

                            //SQL
                            $sqlStart = 'UPDATE users SET ';
                            $sqlEnd = ' WHERE userID = "'.$request->uid.'" LIMIT 1;';
                            $sqlPass = null;
                            $sqlMail = null;
                            if($r > 0 && $newPassword){
                                // SQL
                                $sqlPass = ' password = "'.$newPassword.'"';
                            }
                            if($email){
                                //SQL
                                $sqlMail = ' email = "'.$email.'"';
                            }

                            //SQL-Gesamt
                            if(isset($sqlPass) && isset($sqlMail)){
                                $sqlSum = $sqlStart.$sqlPass.','.$sqlMail.$sqlEnd;
                            } else if(isset($sqlPass)){
                                $sqlSum = $sqlStart.$sqlPass.$sqlEnd;
                            } else if(isset($sqlMail)){
                                $sqlSum = $sqlStart.$sqlMail.$sqlEnd;
                            }
                            $db->query($sqlSum);



                            if($db->affected_rows > 0) {
                                $response = [
                                    "msg" => "Ihre Daten wurden geändert."
                                ];
                                if($email){
                                    $response["email"] = $email;
                                }
                            } else {
                                $response = [
                                    "errMsg" => "Ihre Daten konnten nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns."
                                ];
                            }
                        }
                    }

                    break;

                case 'deleteUserByID':
                    if(isset($request->uid) &&
                        isset($_SESSION['uid']) &&
                        ($request->uid == $_SESSION['uid'] ||
                            $_SESSION['credits'] == 2)
                    ){

                        // SQL
                        $sql = 'UPDATE users SET status = 1 WHERE userID = "'.$request->uid.'" LIMIT 1;';


                        $r = $db->query($sql)?$db->affected_rows:false;
                        
                        if($r > 0){
                            $response = [
                                "msg" => "Schade, dass Sie sich abmelden. Wir wünschen Ihnen alles Gute."
                            ];
                        } else {
                            $response = [
                                "errMsg" => "Das Löschen Ihres Profils war nicht erfolgreich. Bitte versuchen Sie es erneut oder Kontaktieren Sie uns."
                            ];
                        }

                    }// END IF User-Auth


                    break;
            }// END Switch
            if(!empty($response)){
                echo json_encode($response);
            }
        } // END IF Request-Type
    } // END IF USER-Session
}