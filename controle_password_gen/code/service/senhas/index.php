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
    $sql_senhas = new SQLSenhas($bd, $cript);

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
        $http_util->retorno("", false, 401);
    }

    function tratar_post($http_util, $sql_usuarios, $sql_token, $sql_senhas){
        $tipo=$http_util->get_querystring_value("tipo");
        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;
        $tipos_validos = ['listar', 'salvar', 'editar', 'excluir' ];

        if (!isset($tipo) || !in_array($tipo, $tipos_validos)){
            $msg = !isset($tipo) ? "Informe o tipo" : "Tipo inválido (".(isset($tipo)?$tipo:"null").")";
            $http_util->retorno($msg, false, 404);
            return;
        }

        if ($tipo == "listar"){
            if (!tem_permissao($http_util, $sql_token)){return;}

            //echo "token: [{$token}]<br />";

            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");

            $token = get_token($http_util, $sql_token);
            $id_token = $token->getId();

            if (!isset($id_usuario) || !isset($dominio) || !isset($id_token) ||
                $id_token != $id_usuario){
                $http_util->retorno("Erro", false, 404); return;
            }

            $senhas = $sql_senhas->list_senhas($id_usuario, $dominio);
            if (!$senhas || count($senhas) <= 0){
                $http_util->retorno([], true, 200); return;
            }
            //foreach ($senhas as $senha) { echo "$senha <br>"; }
            $array[] = []; $array = array_shift($array);
            foreach ($senhas as $senha) { array_push($array, $senha->__toJson()); }
            $http_util->retorno($array, true, 200);
            return;
        }

        if ($tipo == "salvar"){
            if (!tem_permissao($http_util, $sql_token)){return;}
            //echo "token: [{$token}]<br />";

            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");

            $token = get_token($http_util, $sql_token);
            $id_token = $token->getId();

            if (!isset($id_usuario) || !isset($dominio) || 
                !isset($login) || !isset($senha) || 
                !isset($id_token) || $id_token != $id_usuario){
                $http_util->retorno("Erro", false, 404); return;
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
            if (isset($rt) && isset($rt["senha"])){
                $rt["senha"] = $rt["senha"]->__toJson();
            }

            if (!isset($rt) || !$rt["ok"]){ 
                $http_util->retorno($rt, true, 404); return;
            }

            $http_util->retorno($rt, true, 201);return;
        }
        
        if ($tipo == "editar"){
            if (!tem_permissao($http_util, $sql_token)){return;}

            $id_senha = $http_util->get_body_value("id_senha");
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");

            $token = get_token($http_util, $sql_token);
            $id_token = $token->getId();

            if (!isset($id_senha) || !isset($id_usuario) || 
                !isset($dominio) || 
                !isset($login) || !isset($senha) || 
                !isset($id_token) || $id_token != $id_usuario){
                $http_util->retorno("Erro", false, 404); return;
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
            if (isset($rt) && isset($rt["senha"])){
                $rt["senha"] = $rt["senha"]->__toJson();
            }

            if (!isset($rt) || !$rt["ok"]){
                $http_util->retorno($rt, true, 404); return;
            }

            $http_util->retorno($rt, true, 201);return;
        }

        if ($tipo == "excluir"){
            if (!tem_permissao($http_util, $sql_token)){return;}

            $id_senha = $http_util->get_body_value("id_senha");
            $id_usuario = $http_util->get_body_value("id_usuario");
            $dominio = $http_util->get_body_value("dominio");

            $token = get_token($http_util, $sql_token);
            $id_token = $token->getId();

            if (!isset($id_senha) || !isset($id_usuario) || 
                !isset($dominio) || 
                !isset($id_token) || $id_token != $id_usuario){
                $http_util->retorno("Erro", false, 404); return;
            }

            $senha_excluir = new Senha(
                $id_senha,
                $id_usuario,
                $dominio,
                null, null
            );

            # echo "excluir: ".$token."\r\n\nsenha_excluir: ".$senha_excluir;

            $rt = $sql_senhas->delete_senha($senha_excluir);
            if (isset($rt) && isset($rt["senha"])){
                $rt["senha"] = $rt["senha"]->__toJson();
            }

            if (!isset($rt) || !$rt["ok"]){ 
                $http_util->retorno($rt, true, 404); return;
            }

            $http_util->retorno($rt, true, 201);return;
        }

    }

    function get_token($http_util, $sql_token){
        return $sql_token->get_by_token(base64_decode($http_util->get_header_value("authorization")));
    }

    function tem_permissao($http_util, $sql_token){
        $authorizacao = $http_util->get_header_value("authorization");
        if (!isset($authorizacao) || !$http_util->is_token_ok($sql_token, false)){
            $http_util->retorno("Sem permissão", false, 401);
            return false;
        }

        $token = get_token($http_util, $sql_token);
        if (!isset($token)){ $http_util->retorno("Sem permissão", false, 401); return false; }
        return true;
    }

    $http_util->retorno("", false, 401);
?>