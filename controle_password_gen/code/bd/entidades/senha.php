<?php

class Senha {

    //id_senha,id_usuario,dominio,login,senha
    private $_id_senha;
    private $_id_usuario;
    private $_dominio;
    private $_login;
    private $_senha;

    public function __construct(
        $id_senha = 0,
        $id_usuario = 0,
        $dominio = "",
        $login = "",
        $senha = ""
    ) {
        $this->_id_senha = $id_senha;
        $this->_id_usuario = $id_usuario;
        $this->_dominio = $dominio;
        $this->_login = $login;
        $this->_senha = $senha;
    }

    public function getIdSenha() {return $this->_id_senha;}
    public function setIdSenha($id_senha) {$this->_id_senha= $id_senha;}
    public function getIdUsuario() {return $this->_id_usuario;}
    public function setIdUsuario($id_usuario) {$this->_id_usuario=$id_usuario;}
    public function getDominio() {return $this->_dominio;}
    public function setDominio($dominio) {$this->_dominio=$dominio;}
    public function getLogin() {return $this->_login;}
    public function setLogin($login) {$this->_login=$login;}
    public function getSenha() {return $this->_senha;}
    public function setSenha($senha) {$this->_senha=$senha;}

    public function __toJson($add_senha = true){
        $rt = [
            "id_senha" => $this->getIdSenha(),
            "id_usuario" => $this->getIdUsuario(),
            "dominio" => $this->getDominio(),
            "login" => $this->getLogin()
        ];
        if (isset($add_senha) && $add_senha){ $rt["senha"] = $this->getSenha(); }
        return $rt;
    }

    // serialize(...)
    public function __toString() {
        return "id_senha: {$this->getIdSenha()}, id_usuario: {$this->getIdUsuario()}, ". 
                "dominio: {$this->getDominio()}, login: {$this->getLogin()}, " .
                "senha: {$this->getSenha()}";
    }

}
?>