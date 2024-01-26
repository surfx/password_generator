<?php

class Token {

    private $_id;
    private $_token;
    private $_validade;

    public function __construct(
        $id = "",
        $token = "",
        $validade = ""
    ) {
        $this->_id = $id;
        $this->_token = $token;
        $this->_validade = $validade;
    }

    public function getId() {return $this->_id;}
    public function setId($id) {$this->_id= $id;}
    public function getToken() {return $this->_token;}
    public function setToken($token) {$this->_token=$token;}
    public function getValidade() {return $this->_validade;}
    public function setValidade($validade) {$this->_validade=$validade;}

    public function is_admin(){
        // 1 é o id do usuário master
        return $this->getId() == "1";
    }

    public function __toJson(){
        return [
            "id" => $this->getId(),
            "token" => $this->getToken(),
            "validade" => $this->getValidade()
            //"is_admin" => $this->is_admin()
        ];
    }

    // serialize(...)
    public function __toString() {
        //"is_admin: {$this->is_admin()}
        return "id: {$this->_id}, token: {$this->_token}, ". 
                "validade: {$this->_validade}";
    }

}
?>