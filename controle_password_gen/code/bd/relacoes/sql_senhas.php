<?php

class SQLSenhas {

    private $_base_aux; // BaseDadosAux
    private $_cript; //Criptografia
    private $_sql_usuarios; //SQLUsuarios

    public function __construct(
        $base_aux,
        $cript,
        $sql_usuarios
    ) {
        $this->_base_aux = $base_aux;
        $this->_cript = $cript;
        $this->_sql_usuarios = $sql_usuarios;
    }

    // select
    public function list_senhas($id_usuario, $dominio){
        if (!isset($id_usuario) || !isset($dominio) || 
            !isset($this->_base_aux) || 
            !isset($this->_cript)){return null;}

        $sql = "SELECT id_senha, id_usuario, dominio, login, senha ".
               "FROM senhas ".
               "WHERE id_usuario = ".$id_usuario." ".
               "AND dominio = '".$dominio."'";

        //foreach ($senhas as $senha) { echo "$senha <br>"; }
        return $this->_base_aux->get_result($sql, function($row) { return $this->converter_senhas($row); });
    }

    // insert
    public function insert_senha($senha){
        $rt = array("ok" => false, "msg" => "", "data" => null);
        if (!isset($senha) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Senha inválida";
            return $rt;
        }

        $rt = $this->validar_senha($senha);
        if (!$rt["ok"]){return $rt;}

        //$senha->getSenha()
        $senha_by_lsd = $this->existe_login_senha_dominio(
            $senha->getIdUsuario(),
            $senha->getDominio(),
            $senha->getLogin(),
            null
        );

        if (isset($senha_by_lsd) && $senha_by_lsd["existe"]){
            $aux = $senha;
            if (isset($senha_by_lsd["data"])){
                $aux = $senha_by_lsd["data"];
            }

            $rt["ok"] = false;
            $rt["msg"] = "Já existe o login (".$senha->getLogin().") para o domínio (".$senha->getDominio().")";
            $rt["data"] = $aux;
            return $rt;
        }
        
        $sql = "INSERT INTO senhas (id_usuario, dominio, login, senha) VALUES (".
            " ".$senha->getIdUsuario().", '".$senha->getDominio()."', ".
            " '".$senha->getLogin()."', ".
            " '".$this->_cript->criptografar($senha->getSenha())."' ".
            ");";
        
        //echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = "Senha salva com sucesso";
        $rt["data"] = $this->get_senha_params(
            $senha->getIdUsuario(),
            $senha->getDominio(),
            $senha->getLogin(),
            $senha->getSenha());
        return $rt;
    }

    // update
    public function update_senha($senha){
        $rt = array("ok" => false, "msg" => "", "data" => null);
        if (!isset($senha) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Senha inválida";
            return $rt;
        }

        $rt = $this->validar_senha($senha, true);
        if (!$rt["ok"]){return $rt;}
        
        $senha_byid = $this->get_senha_byid($senha->getIdSenha());
        $id_senha = isset($senha_byid) ? $senha_byid->getIdSenha() : null;
        if (!isset($senha_byid) || 
            !isset($id_senha) || 
            $senha_byid->getIdSenha() <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Não existe o id informado: ".$senha->getIdSenha();
            $rt["data"] = $senha;
            return $rt;
        }

        // verifica se o login existe para o domínio
        $senha_by_lsd = $this->existe_login_senha_dominio(
            $senha->getIdUsuario(),
            $senha->getDominio(),
            $senha->getLogin(),
            null
        );

        if (
            isset($senha_by_lsd) && 
            $senha_by_lsd["existe"] &&
            isset($senha_by_lsd["data"]) &&
            $senha_by_lsd["data"]->getIdSenha() != $senha->getIdSenha()
        ){
            $aux = (isset($senha_by_lsd["data"]) ? $senha_by_lsd["data"] : $senha);
            $rt["ok"] = false;
            $rt["msg"] = "Já existe o login (".$senha->getLogin().") para o domínio (".$senha->getDominio().")";
            $rt["data"] = $aux;
            return $rt;
        }

        $sql =  "UPDATE senhas SET ".
                "login='".$senha->getLogin()."', ".
                "senha = '".$this->_cript->criptografar($senha->getSenha())."' ".
                "WHERE id_senha = ".$senha->getIdSenha()." ".
                "AND id_usuario = ".$senha->getIdUsuario()." ".
                "AND dominio = '".$senha->getDominio()."' ";
        
        //echo $sql."<br><br>\r\n\n";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = "Senha salva com sucesso";
        $rt["data"] = $this->get_senha_params(
            $senha->getIdUsuario(),
            $senha->getDominio(),
            $senha->getLogin(),
            $senha->getSenha());
        return $rt;
    }

    // update_save_senhas
    public function update_save_senhas($senhas, $id_usuario){
        $rt = array("ok" => false, "msg" => "Erro ao salvar as senhas");
        if (!isset($senhas) || count($senhas) <= 0 || !isset($id_usuario) || !isset($this->_sql_usuarios) || !isset($this->_cript)){ return $rt; }

        $rt["ok"] = true;
        $rt["msg"] = "Senhas atualizadas/inseridas na base de dados";

        foreach ($senhas as $senha) {
            if (
                !isset($senha) ||
                $senha->getIdUsuario() <= 0 || 
                $senha->getDominio() == null || strlen(trim($senha->getDominio())) <= 0 || 
                $senha->getLogin() == null || strlen(trim($senha->getLogin())) <= 0 || 
                $senha->getSenha() == null || strlen(trim($senha->getSenha())) <= 0 ||
                $senha->getIdUsuario() != $id_usuario
            ){ continue; }
            
            // verifica se o id do usuário informado existe na base de dados
            if (!$this->_sql_usuarios->existe_id($senha->getIdUsuario())){
                continue;
            }

            $senha_by_lsd = $this->existe_login_senha_dominio(
                $senha->getIdUsuario(),
                $senha->getDominio(),
                $senha->getLogin(),
                null
            );
            if (
                isset($senha_by_lsd) && 
                $senha_by_lsd["existe"] &&
                isset($senha_by_lsd["data"])
            ) {
                $sql =  "UPDATE senhas SET ".
                "senha = '".$this->_cript->criptografar($senha->getSenha())."' ".
                "WHERE id_usuario = ".$senha->getIdUsuario()." ".
                "AND id_senha = ".$senha_by_lsd["data"]->getIdSenha()." ".
                "AND dominio = '".$senha->getDominio()."' ";
                //echo $sql."<br><br>\r\n\n";
                $this->_base_aux->execute_sql($sql);
                continue;
            }
            $this->insert_senha($senha);
        }

        return $rt;
    }

    // delete
    public function delete_senha($senha_obj){
        $rt = array("ok" => false, "msg" => "", "data" => $senha_obj);
        if (!isset($senha_obj) || !isset($this->_base_aux) || !isset($this->_cript)){
            $rt["msg"] = "Senha inválida";
            return $rt;
        }

        $rt = $this->validar_campos_delete(
                $senha_obj->getIdSenha(), 
                $senha_obj->getIdUsuario(), 
                $senha_obj->getDominio()
            );
        $rt["data"] = $senha_obj;
        if (!$rt["ok"]){return $rt;}
        
        $senha_byid = $this->get_senha_aux_excluir(
            $senha_obj->getIdSenha(), 
            $senha_obj->getIdUsuario(), 
            $senha_obj->getDominio()
        );
        $id_senha = isset($senha_byid) ? $senha_byid->getIdSenha() : null;
        if (!isset($senha_byid) || 
            !isset($id_senha) || 
            $senha_byid->getIdSenha() <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Não existe o id informado: ".$senha_obj->getIdSenha();
            return $rt;
        }

        $sql =  "DELETE FROM senhas ".
                "WHERE id_senha = ".$senha_obj->getIdSenha()." ".
                "AND id_usuario = ".$senha_obj->getIdUsuario()." ".
                "AND dominio = '".$senha_obj->getDominio()."' ";
        
        //echo $sql."<br><br>\r\n\n";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = "Senha excluída com sucesso";
        return $rt;
    }

    private function validar_senha($senha_obj, $validar_id_senha = false){
        $rt = array("ok" => false, "msg" => "", "data" => $senha_obj);
        if (!isset($senha_obj)){return $rt;}
        $rt["ok"] = true;

        $id_usuario = $senha_obj->getIdUsuario();
        $dominio = $senha_obj->getDominio();
        $login = $senha_obj->getLogin();
        $senha = $senha_obj->getSenha();

        $id_usuario = isset($id_usuario) ? trim($id_usuario) : null;
        $dominio = isset($dominio) ? trim($dominio) : null;
        $login = isset($login) ? trim($login) : null;
        $senha = isset($senha) ? trim($senha) : null;

        if (!isset($id_usuario) || strlen($id_usuario) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Id usuário inválido";
            return $rt;
        }
        if (!isset($dominio) || strlen($dominio) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Domínio inválido";
            return $rt;
        }
        if (
            !isset($login) || strlen($login) <= 0 
            // || !filter_var($login, FILTER_VALIDATE_EMAIL)
        ){
            $rt["ok"] = false;
            $rt["msg"] = "Login inválido".(isset($login) ? " ".$login : "");
            return $rt;
        }
        if (!isset($senha) || strlen($senha) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Senha inválida";
            return $rt;
        }

        if ($validar_id_senha){
            $id_senha = $senha_obj->getIdSenha();
            if (!isset($id_senha) || strlen(trim($id_senha)) <= 0){
                $rt["ok"] = false;
                $rt["msg"] = "Id senha inválida";
                return $rt;
            }
        }

        return $rt;
    }

    private function validar_campos_delete($id_senha, $id_usuario, $dominio){
        $rt = array("ok" => true, "msg" => "");
        $id_senha = isset($id_senha) ? trim($id_senha) : null;
        $id_usuario = isset($id_usuario) ? trim($id_usuario) : null;
        $dominio = isset($dominio) ? trim($dominio) : null;

        if (!isset($id_senha) || strlen($id_senha) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Id senha inválida";
            return $rt;
        }
        if (!isset($id_usuario) || strlen($id_usuario) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Id usuário inválido";
            return $rt;
        }
        if (!isset($dominio) || strlen($dominio) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Domínio inválido";
            return $rt;
        }

        return $rt;
    }

    private function get_senha_aux_excluir($id_senha, $id_usuario, $dominio){
        if (!isset($id_senha) || !isset($id_usuario) || !isset($dominio) || !isset($this->_base_aux) || !isset($this->_cript)){return null;}
        $sql =  "SELECT id_senha,id_usuario,dominio,login,senha FROM senhas ".
                "WHERE id_senha = ".$id_senha." ".
                "AND id_usuario = ".$id_usuario." ".
                "AND dominio = '".$dominio."' ".
                "LIMIT 1";
        $senhas = $this->_base_aux->get_result($sql, function($row) { return $this->converter_senhas($row); });
        if (!isset($senhas) || count($senhas) <= 0){return null;}
        return $senhas[0];
    }

    private function get_senha_byid($id_senha){
        if (!isset($id_senha) || !isset($this->_base_aux) || !isset($this->_cript)){return null;}

        $sql = "SELECT id_senha,id_usuario,dominio,login,senha FROM senhas ".
               "WHERE id_senha = $id_senha ".
               "LIMIT 1";
        //echo $sql."<br><br>\r\n\n\n";

        $senhas = $this->_base_aux->get_result($sql, function($row) { return $this->converter_senhas($row); });
        if (!isset($senhas) || count($senhas) <= 0){return null;}
        return $senhas[0];
    }

    private function get_senha_params($id_usuario, $dominio, $login, $senha){
        if (!isset($id_usuario) || !isset($dominio) || !isset($login) || 
            !isset($this->_base_aux) || !isset($this->_cript)){return null;}
        
        $senha_cripto = isset($senha) ? $this->_cript->criptografar($senha) : null;
        $sql = "SELECT id_senha,id_usuario,dominio,login,senha FROM senhas ".
               "WHERE id_usuario = $id_usuario ".
               "AND dominio = '$dominio' ".
               "AND login = '$login' ";

        if (isset($senha_cripto)){
            $sql = $sql." AND senha = '$senha_cripto' ";
        }

        $sql = $sql." LIMIT 1";
        //echo $sql."<br><br>\r\n\n\n";

        $senhas = $this->_base_aux->get_result($sql, function($row) { return $this->converter_senhas($row); });
        if (!isset($senhas) || count($senhas) <= 0){return null;}
        return $senhas[0];
    }

    private function existe_login_senha_dominio($id_usuario, $dominio, $login, $senha){
        $aux = $this->get_senha_params($id_usuario, $dominio, $login, $senha);
        return [ "existe" => isset($aux) && $aux->getIdSenha() > 0, "data" => $aux ]; // array
    }


    private function converter_senhas($row){
        if (!isset($row)){return null;}

        $id_senha = $row["id_senha"];
        $id_senha = isset($id_senha) ? intval($id_senha) : 0;

        $id_usuario = $row["id_usuario"];
        $id_usuario = isset($id_usuario) ? intval($id_usuario) : 0;

        return new Senha(
            $id_senha,
            $id_usuario,
            $row["dominio"],
            $row["login"],
            $this->_cript->decriptografar($row["senha"])
        );
    }
}