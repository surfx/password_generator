<?php

include 'entidades/usuario.php';

class BaseDadosAux {

    private $servername;
    private $username;
    private $password;
    private $dbname;

    private $my_conn = null;

    public function __construct(
        $servername,
        $username,
        $password,
        $dbname
    ) {
        $this->servername = $servername;
        $this->username = $username;
        $this->password = $password;
        $this->dbname = $dbname;
    }

    public function __toString(){
        return "servername: '$this->servername', username: '$this->username', password: '$this->password', dbname: '$this->dbname'<br />\n";
    }

    private function get_connection() {
        if ($this->is_open($this->my_conn)){ return $this->my_conn; }

        $this->my_conn = new mysqli($this->servername, $this->username, $this->password, $this->dbname);
        
        // Check connection
        if ($this->my_conn->connect_error) {
          die("Connection failed: " . $this->my_conn->connect_error);
          return null;
        }
        return $this->my_conn;
    }

    private function is_open(){
        return !is_null($this->my_conn) && $this->my_conn->ping();
    }

    private function close_connection(){
        $this->my_conn->close();
        $this->my_conn = null;
    }

    public function get_result($sql, $converter){
        if (!isset($sql) || !isset($converter) || !is_callable($converter)){ return null; }
        if (!$this->is_open()){ $this->my_conn = $this->get_connection(); }
        if (!$this->is_open()){
            //echo "Erro ao recuperar a conexão<br>";
            $this->close_connection();
            return null;
        }

        //echo $sql."<br />";

        $result = $this->my_conn->query($sql);
        if (!isset($result) || $result->num_rows <= 0) {
            $this->close_connection();
            //echo $result->num_rows." results - ".isset($result)."<br/>";
            return null;
        }

        $rt = array();

        while($row = $result->fetch_assoc()) {
            if (!isset($row)){continue;}
            $item_aux = $converter($row);
            if (!isset($item_aux)){continue;}
            array_push($rt, $converter($row));
        }

        $this->close_connection();

        return $rt;
    }

    public function execute_sql($sql){
        if (!isset($sql)){ return false; }
        if (!$this->is_open()){ $this->my_conn = $this->get_connection(); }
        if (!$this->is_open()){
            //echo "Erro ao recuperar a conexão<br>";
            $this->close_connection();
            return false;
        }

        $rt = false;
        if ($this->my_conn->query($sql) === TRUE) {
          //echo "New record created successfully";
          $rt = true;
        }
        // else {
        //   echo "Error: " . $sql . "<br>" . $this->my_conn->error;
        // }

        $this->close_connection();

        return $rt;
    }

}

?>