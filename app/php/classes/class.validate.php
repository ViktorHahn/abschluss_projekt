<?php

class validate {

//
// @ param muss ein JSON-String sein
// @ return gibt ein Objekt wieder
//

    static public function trimStripJson($data){
        $data = json_decode($data);
        $newData = new stdClass();
        $db = db::getInstance()->getConnection();
        foreach ($data as $key => $value) {

            $key = $db->real_escape_string(trim(strip_tags($key)));
            $newData->$key = $db->real_escape_string(trim(strip_tags($value)));
        }
        return $newData;
    }
}
