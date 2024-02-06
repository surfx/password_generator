<?php

    include '../../propriedades/propriedades.php';
    include '../../util/http_util.php';
    include '../../bd/entidades/token.php';
    include '../../bd/entidades/senha.php';
    include '../../bd/base_dados_aux.php';
    include '../..//bd/relacoes/sql_usuarios.php';
    include '../..//bd/relacoes/sql_senhas.php';
    include '../..//bd/tokens/sql_tokens.php';
    include '../../criptografia/criptografia.php';

    $http_util = new HTTPUtil();
    $bd = new BaseDadosAux(
        $mysql_servername,
        $mysql_username,
        $mysql_password,
        $mysql_dbname
    );
    //echo $bd->__toString();
    $cript = new Criptografia();
    $sql_usuarios = new SQLUsuarios($bd, $cript);
    $sql_token = new SQLToken($bd);
    $sql_senhas = new SQLSenhas($bd, $cript, $sql_usuarios);

    //-----------------------------------
    $method=$http_util->get_request_method();
    $method=isset($method)?strtolower(trim($method)):"";


    switch($method){
        case 'post': tratar_post($http_util, $sql_usuarios, $sql_token, $sql_senhas); return;
        case 'get': tratar_get($http_util, $sql_usuarios, $sql_token, $sql_senhas); return;
    }
?>

<?php
    function tratar_get($http_util, $sql_usuarios, $sql_token, $sql_senhas){
        $http_util->retorno_erro("Erro", 401);
    }

    function tratar_post($http_util, $sql_usuarios, $sql_token, $sql_senhas){
        $tipo=$http_util->get_querystring_value("tipo");
        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;
        $tipos_validos = ['listar', 'salvar', 'editar', 'excluir', 'update_insert' ];

        if (!isset($tipo) || !in_array($tipo, $tipos_validos)){
            $msg = !isset($tipo) ? "Informe o tipo" : "Tipo inválido (".(isset($tipo)?$tipo:"null").")";
            $http_util->retorno_erro($msg, 404);
            return;
        }

        if ($tipo == "listar"){
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            if (!$http_util->tem_permissao($sql_token, $id_usuario)){return;}
            if (!isset($id_usuario) || !isset($dominio)){
                $http_util->retorno_erro("Erro", 404); return;
            }

            $senhas = $sql_senhas->list_senhas($id_usuario, $dominio);
            if (!$senhas || count($senhas) <= 0){
                $http_util->retorno(["ok" => true, "data" => null], true, 200); return;
            }
            //foreach ($senhas as $senha) { echo "$senha <br>"; }
            $array[] = []; $array = array_shift($array);
            foreach ($senhas as $senha) { array_push($array, $senha->__toJson()); }
            $http_util->retorno(["ok" => true, "data" => $array], true, 200);
            return;
        }

        if ($tipo == "salvar"){
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");
            if (!$http_util->tem_permissao($sql_token, $id_usuario)){return;}
            //echo "token: [{$token}]<br />";

            if (!isset($id_usuario) || !isset($dominio) || 
                !isset($login) || !isset($senha)){
                $http_util->retorno_erro("Erro", 404); return;
            }

            $senha_salvar = new Senha(
                null,
                $id_usuario,
                $dominio,
                $login,
                $senha
            );
            //echo "senha_salvar: $senha_salvar\r\n\r\n";

            $rt = $sql_senhas->insert_senha($senha_salvar);
            if (isset($rt) && isset($rt["data"])){
                // máscara a senha
                $rt["data"] = $rt["data"]->__toJson(false);
            }

            if (!isset($rt) || !$rt["ok"]){  $http_util->retorno($rt, true, 404); return; }

            $http_util->retorno($rt, true, 201);return;
        }
        
        if ($tipo == "editar"){
            $id_senha = $http_util->get_body_value("id_senha");
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");
            if (!$http_util->tem_permissao($sql_token, $id_usuario)){return;}

            if (!isset($id_senha) || !isset($id_usuario) || 
                !isset($dominio) || 
                !isset($login) || !isset($senha)){
                $http_util->retorno_erro("Erro", 404); return;
            }

            $senha_atualizar = new Senha(
                $id_senha,
                $id_usuario,
                $dominio,
                $login,
                $senha
            );
            //echo "senha_atualizar: $senha_atualizar\r\n\r\n";

            $rt = $sql_senhas->update_senha($senha_atualizar);
            if (isset($rt) && isset($rt["data"])){
                // máscara a senha
                $rt["data"] = $rt["data"]->__toJson(false);
            }

            if (!isset($rt) || !$rt["ok"]){ $http_util->retorno($rt, true, 404); return; }

            $http_util->retorno($rt, true, 201);return;
        }

        if ($tipo == "excluir"){
            $id_senha = $http_util->get_body_value("id_senha");
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            if (!$http_util->tem_permissao($sql_token, $id_usuario)){return;}

            if (!isset($id_senha) || !isset($id_usuario) || !isset($dominio)){
                $http_util->retorno_erro("Erro", 404); return;
            }

            $senha_excluir = new Senha(
                $id_senha,
                $id_usuario,
                $dominio,
                null, null
            );

            # echo "excluir: ".$token."\r\n\nsenha_excluir: ".$senha_excluir;

            $rt = $sql_senhas->delete_senha($senha_excluir);
            if (isset($rt) && isset($rt["data"])){
                $rt["data"] = $rt["data"]->__toJson(false);
            }

            if (!isset($rt) || !$rt["ok"]){ 
                $http_util->retorno($rt, true, 404); return;
            }

            $http_util->retorno($rt, true, 201);return;
        }

        // permite atualizar/inserir várias senhas para um determinado usuário
        // caso: salvar senhas no navegador do usuário
        if ($tipo == "update_insert"){
            $id_usuario = $http_util->get_header_value("id_usuario");
            $body = $http_util->get_body(true);

            if (!$http_util->tem_permissao($sql_token, $id_usuario)){return;}
            if(!isset($body) || count($body) <= 0){ $http_util->retorno_erro("Erro. Informe as senhas", 404); return; }

            $array[] = []; $array = array_shift($array);
            foreach ($body as $senha) {
                if (!isset($senha)){continue;}
                if (
                    !isset($senha['id_usuario']) ||
                    strlen(trim($senha['id_usuario'])) <= 0
                ){ $senha['id_usuario'] = $id_usuario; }

                $aux = toSenha($senha);
                if (!isset($aux)){ continue; }
                array_push($array, $aux);
            }

            if(!isset($array) || count($array) <= 0){ $http_util->retorno_erro("Erro. Informe as senhas", 404); return; }

            $rt = $sql_senhas->update_save_senhas($array, $id_usuario);
            if (!isset($rt) || !$rt["ok"]){ $http_util->retorno($rt, true, 404); return; }
            //foreach ($array as $senha) { echo $senha->__toString()."\r\n"; }
            //for($i = 0; $i < count($array); $i++){ $array[$i] = $array[$i]->__toJson(); }
            //$http_util->retorno($array, true, 201);return;

            $http_util->retorno($rt, true, 201);return;
        }
        

    }

    function toSenha($json){
        if (!isset($json)){return null;}
        $rt = new Senha(
            isset($json['id_senha']) ? $json['id_senha'] : 0,
            isset($json['id_usuario']) ? $json['id_usuario'] : 0,
            isset($json['dominio']) ? $json['dominio'] : '',
            isset($json['login']) ? $json['login'] : '',
            isset($json['senha']) ? $json['senha'] : ''
        );
        // if ($rt->getIdUsuario() <= 0 || 
        //     $rt->getDominio() == null || strlen(trim($rt->getDominio())) <= 0 || 
        //     $rt->getLogin() == null || strlen(trim($rt->getLogin())) <= 0 || 
        //     $rt->getSenha() == null || strlen(trim($rt->getSenha())) <= 0
        // ) { return null; }
        return $rt;
    }

    $http_util->retorno("", false, 401);
?>