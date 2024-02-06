<?php

class Usuario {

    //id_usuario, nome, uuid, login, senha, verificado, ativo
    private $_id_usuario;
    private $_nome;
    private $_uuid;
    private $_login;
    private $_senha;
    private $_verificado;
    private $_ativo;

    public function __construct(
        $id_usuario = 0,
        $nome = "",
        $uuid = "",
        $login = "",
        $senha = "",
        $verificado = "",
        $ativo = "",
    ) {
        $this->_id_usuario = $id_usuario;
        $this->_nome = $nome;
        $this->_uuid = $uuid;
        $this->_login = $login;
        $this->_senha = $senha;
        $this->_verificado = $verificado;
        $this->_ativo = $ativo;
    }

    public function getIdUsuario() {return $this->_id_usuario;}
    public function setIdUsuario($id_usuario) {$this->_id_usuario= $id_usuario;}
    public function getNome() {return $this->_nome;}
    public function setNome($nome) {$this->_nome=$nome;}
    public function getUUID() {return $this->_uuid;}
    public function setUUID($uuid) {$this->_uuid=$uuid;}
    public function getLogin() {return $this->_login;}
    public function setLogin($login) {$this->_login=$login;}
    public function getSenha() {return $this->_senha;}
    public function setSenha($senha) {$this->_senha=$senha;}
    public function getVerificado() {return $this->_verificado;}
    public function setVerificado($verificado) {$this->_verificado=$verificado;}
    public function getAtivo() {return $this->_ativo;}
    public function setAtivo($ativo) {$this->_ativo=$ativo;}

    public function __toJson(){
        return [
            "id_usuario" => $this->getIdUsuario(),
            "nome" => $this->getNome(),
            "uuid" => $this->getUUID(),
            "login" => $this->getLogin(),
            "senha" => $this->getSenha(),
            "verificado" => $this->getVerificado()=="1",
            "ativo" => $this->getAtivo()=="1"
        ];
    }

    // serialize(...)
    public function __toString() {
        //{$this->getSenha()}
        return "id_usuario: {$this->getIdUsuario()}, nome: {$this->getNome()}, ". 
                "uuid: {$this->getUUID()}, login: {$this->getLogin()}, " .
                "senha: null, verificado: {$this->getVerificado()}, ".
                "ativo: {$this->getAtivo()}";
    }

}
?>