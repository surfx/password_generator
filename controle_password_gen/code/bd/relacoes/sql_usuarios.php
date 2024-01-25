<?php

class SQLUsuarios {

    private $_base_aux; // BaseDadosAux
    private $_cript; //Criptografia

    public function __construct(
        $base_aux,
        $cript
    ) {
        $this->_base_aux = $base_aux;
        $this->_cript = $cript;
    }

    public function list_users($ativo = null, $top=null){
        if (!isset($this->_base_aux) || 
            !isset($this->_cript)){return null;}

        $sql = "SELECT id_usuario, nome, uuid, login, senha, verificado, ativo ".
               "FROM usuarios ";
        if (isset($ativo)){
            $sql = $sql." WHERE ativo = '".($ativo?"1":"0")."' ";
        }
        if (isset($top) && intval($top) > 0){
            $sql = $sql." LIMIT ".$top." ";
        }

        //foreach ($usuarios as $usuario) { echo "$usuario <br>"; }
        return $this->_base_aux->get_result($sql, function($row) { return $this->converter_user($row); });
    }

    public function do_login($login, $senha){
        if (!isset($login) || !isset($senha) || 
            !isset($this->_base_aux) || 
            !isset($this->_cript)){return null;}

        $sql = "SELECT id_usuario, nome, uuid, login, senha, verificado, ativo ".
               "FROM usuarios ".
               "WHERE login = '$login' ".
               "AND senha = '".$this->_cript->criptografar($senha)."' ".
               "AND ativo = '1'";

        $usuarios = $this->_base_aux->get_result($sql, function($row) { return $this->converter_user($row); });

        if (!isset($usuarios) || count($usuarios) <= 0){return null;}
        //foreach ($usuarios as $usuario) { echo "$usuario <br>"; }

        return $usuarios[0];
    }

    public function insert_user($usuario){
        $rt = array("ok" => false, "msg" => "", "usuario" => null);
        if (!isset($usuario) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Usuário inválido";
            return $rt;
        }

        $rt = $this->validar_usuario($usuario);
        if (!$rt["ok"]){return $rt;}

        $user_bylogin = $this->get_user_bylogin($usuario->getLogin());
        if (isset($user_bylogin)){
            $rt["ok"] = false;
            $rt["msg"] = "Já existe o login informado: ".$usuario->getLogin();
            $rt["usuario"] = $user_bylogin;
            return $rt;
        }

        $sql = "INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES (".
            "'".$usuario->getNome()."', uuid(), '".$usuario->getLogin()."', ".
            "'".$this->_cript->criptografar($usuario->getSenha())."', '".$usuario->getVerificado()."', ".
            "'".$usuario->getAtivo()."' ".
            ");";
        
        #echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["usuario"] = $this->get_user_bylogin($usuario->getLogin());
        return $rt;
    }

    public function update_user($usuario){
        $rt = array("ok" => false, "msg" => "", "usuario" => null);
        if (!isset($usuario) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Usuário inválido";
            return $rt;
        }

        $rt = $this->validar_usuario($usuario, true, true);
        if (!$rt["ok"]){return $rt;}

        $user_byid = $this->get_user_byid($usuario->getIdUsuario());
        $id_user = isset($user_byid) ? $user_byid->getIdUsuario() : null;
        if (!isset($user_byid) || 
            !isset($id_user) || 
            $user_byid->getIdUsuario() <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Não existe o id informado: ".$usuario->getIdUsuario();
            $rt["usuario"] = $usuario;
            return $rt;
        }

        $id_user = $usuario->getIdUsuario();

        $sql = "UPDATE usuarios SET ".
                " nome = '".$usuario->getNome()."', uuid = '".$usuario->getUUID()."',  ".
                " login = '".$usuario->getLogin()."', ".
                " senha = '".$this->_cript->criptografar($usuario->getSenha())."', ".
                " verificado = '".$usuario->getVerificado()."', ".
                " ativo = '".$usuario->getAtivo()."' ".
                " WHERE id_usuario = ".$id_user;
        
        #echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["usuario"] = $this->get_user_byid($id_user);
        return $rt;
    }

    public function ativar_inativar_usuario($id_usuario, $ativo){
        $rt = array("ok" => false, "msg" => "");
        if (!isset($id_usuario) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Id usuário inválido";
            return $rt;
        }

        $user_byid = $this->get_user_byid($id_usuario);
        if (!isset($user_byid) || 
            $user_byid->getIdUsuario() <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Não existe o id informado: ".$id_usuario;
            return $rt;
        }

        $sql = "UPDATE usuarios SET ".
                " ativo = '".($ativo ? "1": "0")."' ".
                " WHERE id_usuario = ".$id_usuario;
        
        echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = $rt["ok"] ? 
            "Sucesso na ".($ativo?"":"in")."ativacao" : 
            "Erro na ".($ativo?"":"in")."ativacao";
        return $rt;
    }

    public function verificacao_usuario($id_usuario, $verificado){
        $rt = array("ok" => false, "msg" => "");
        if (!isset($id_usuario) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Id usuário inválido";
            return $rt;
        }

        $user_byid = $this->get_user_byid($id_usuario);
        if (!isset($user_byid) || 
            $user_byid->getIdUsuario() <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Não existe o id informado: ".$id_usuario;
            return $rt;
        }

        $sql = "UPDATE usuarios SET ".
                " verificado = '".($verificado ? "1": "0")."' ".
                " WHERE id_usuario = ".$id_usuario;
        
        echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = $rt["ok"] ? 
            "Sucesso salvar verificação" : 
            "Erro salvar verificação";
        return $rt;
    }

    private function validar_usuario($usuario, $verificar_id = false, $verificar_uuid = false){
        $rt = array("ok" => false, "msg" => "", "usuario" => $usuario);
        if (!isset($usuario)){return $rt;}
        $rt["ok"] = true;

        $nome = $usuario->getNome();
        $login = $usuario->getLogin();
        $senha = $usuario->getSenha();
        $verificado = $usuario->getVerificado();
        $ativo = $usuario->getAtivo();

        $nome = isset($nome) ? trim($nome) : null;
        $login = isset($login) ? trim($login) : null;
        $senha = isset($senha) ? trim($senha) : null;
        $verificado = isset($verificado) ? trim($verificado) : null;
        $ativo = isset($ativo) ? trim($ativo) : null;

        if (!isset($nome) || strlen($nome) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Nome inválido";
            return $rt;
        }
        if (
            !isset($login) || strlen($login) <= 0 ||
            !filter_var($login, FILTER_VALIDATE_EMAIL)
        ){
            $rt["ok"] = false;
            $rt["msg"] = "Login inválido";
            return $rt;
        }
        if (!isset($senha) || strlen($senha) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Senha inválida";
            return $rt;
        }
        if (!isset($verificado) || strlen($verificado) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Verificado inválido";
            return $rt;
        }
        if (!isset($ativo) || strlen($ativo) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Ativo inválido";
            return $rt;
        }

        if ($verificar_id){
            $user_id = $usuario->getIdUsuario();
            if (!isset($user_id) || strlen(trim($user_id)) <= 0){
                $rt["ok"] = false;
                $rt["msg"] = "Id usuário inválido";
                return $rt;
            }
        }

        if ($verificar_uuid){
            $uuid = $usuario->getUUID();
            if (!isset($uuid) || strlen(trim($uuid)) <= 0){
                $rt["ok"] = false;
                $rt["msg"] = "UUID inválido";
                return $rt;
            }
        }

        return $rt;
    }

    private function existe_login($login){
        if (!isset($login) || !isset($this->_base_aux)){return false;}
        $usuario = $this->get_user_bylogin($login);
        return isset($usuario);
    }

    private function get_user_bylogin($login){
        if (!isset($login) || !isset($this->_base_aux)){return null;}
        
        $sql = "SELECT id_usuario, nome, uuid, login, senha, verificado, ativo FROM usuarios ".
               "WHERE login = '$login' LIMIT 1";

        #echo $sql."<br><br>";

        $usuarios = $this->_base_aux->get_result($sql, function($row) { return $this->converter_user($row); });

        if (!isset($usuarios) || count($usuarios) <= 0){return null;}
        //foreach ($usuarios as $usuario) { echo "$usuario <br>"; }
        return $usuarios[0];
    }

    private function get_user_byid($id){
        if (!isset($id) || !isset($this->_base_aux)){return null;}
        
        $sql = "SELECT id_usuario, nome, uuid, login, senha, verificado, ativo FROM usuarios ".
               "WHERE id_usuario = '$id' LIMIT 1";

        #echo $sql."<br><br>";

        $usuarios = $this->_base_aux->get_result($sql, function($row) { return $this->converter_user($row); });

        if (!isset($usuarios) || count($usuarios) <= 0){return null;}
        //foreach ($usuarios as $usuario) { echo "$usuario <br>"; }
        return $usuarios[0];
    }


    private function converter_user($row){
        if (!isset($row)){return null;}

        return new Usuario(
            $row["id_usuario"],
            $row["nome"],
            $row["uuid"],
            $row["login"],
            $this->_cript->decriptografar($row["senha"]),
            $row["verificado"],
            $row["ativo"]
        );
    }

}
?>

<?php
// $bd = new BaseDadosAux(
//     $mysql_servername,
//     $mysql_username,
//     $mysql_password,
//     $mysql_dbname
// );
// //echo $bd->__toString();

// $cript = new Criptografia();

// $sql_usuarios = new SQLUsuarios($bd, $cript);

// $lista_usuarios = $sql_usuarios->list_users();
// if (isset($lista_usuarios)) foreach ($lista_usuarios as $usuario) { echo "$usuario <br>"; }


// $user = $sql_usuarios->do_login("seme3@asdas.com", "sadf");
// echo isset($user) ? $user : "not ok";

// echo "<br /><hr><br />";


// //insert_user
// $user_add = new Usuario(null, "Emerson", null, "seme3@asdas.com", "sadf", "1", "1");

// $rt = $sql_usuarios->insert_user($user_add);
// echo ($rt["ok"] ? "sucesso: ".$rt["msg"] : "erro: ".$rt["msg"])."<br />";

// $user_add = $rt["usuario"];
// echo $user_add->__toString()."<br />";

// echo "<br /><hr>UPDATE<br /><hr><br />";
// $user_add->setNome("Emerson 2");
// $user_add->setAtivo('1');

// $rt = $sql_usuarios->update_user($user_add);
// $user_add = $rt["usuario"];
// echo $user_add->__toString()."<br />";


// echo "<br /><hr>ATIVAR/INATIVAR<br /><hr><br />";
// $rt = $sql_usuarios->ativar_inativar_usuario(23, false);
// echo ($rt["ok"]?"sucesso":"erro").", msg: ".$rt["msg"]."<br /><br />";

// echo "<br /><hr>Verificado<br /><hr><br />";
// $rt = $sql_usuarios->verificacao_usuario(3, true);
// echo ($rt["ok"]?"sucesso":"erro").", msg: ".$rt["msg"]."<br /><br />";
?>