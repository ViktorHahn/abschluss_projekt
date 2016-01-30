<?php

class db {
    static private $instance = null;
    private $errMsg;
    private $dbIp = 'localhost';
    private $dbUser = 'djury_db_user';
    private $userPw = 'djpassword';
    private $dbTable = 'djury';
    private $db;

    //constructor erzeugt Datenbankverbindung
    private function __construct(){
        $this->db = new mysqli($this->dbIp, $this->dbUser, $this->userPw, $this->dbTable);
        if(mysqli_connect_error()){
            $this->errMsg = "Datenbankverbindung fehlgeschlagen: ". mysqli_connect_error();
            die($this->errMsg);
        }
    }

    //Erzeugen eines Singletons
    private final function __clone(){}
    static public function getInstance(){
        if(self::$instance === null){
            self::$instance = new self;
        }
        return self::$instance;
    }

    // public fn getConnection
    public function getConnection(){
        return $this->db;
    }
}

//$db = db::getInstance();
//$mysqli = $db->getConnection();
//$sql_query = "SELECT foo FROM .....";
//$result = $mysqli->query($sql_query);