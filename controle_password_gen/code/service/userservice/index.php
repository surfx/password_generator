<?php

    include '../../propriedades/propriedades.php';
    include '../../util/http_util.php';
    include '../../bd/entidades/token.php';
    include '../../bd/base_dados_aux.php';
    include '../..//bd/relacoes/sql_usuarios.php';
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

    //-----------------------------------
    $method=$http_util->get_request_method();
    $method=isset($method)?strtolower(trim($method)):"";


    switch($method){
        case 'post': tratar_post($http_util, $sql_usuarios, $sql_token); return;
        case 'get': default: tratar_get($http_util, $sql_usuarios, $sql_token);
    }
?>

<?php
    function tratar_get($http_util, $sql_usuarios, $sql_token){
        $tipo=$http_util->get_querystring_value("tipo");
        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;
        $tipos_validos = ['tokenvalido', 'listuser', "verificado"];

        if (!isset($tipo) || !in_array($tipo, $tipos_validos)){
            $msg = !isset($tipo) ? "Informe o tipo" : "Tipo inválido (".(isset($tipo)?$tipo:"null").")";
            $http_util->retorno($msg, false, 404);
            return;
        }

        // recuperar os 10 primeiros ativos
        if ($tipo == 'listuser'){
            
            if (!$http_util->is_token_ok($sql_token, true)){
                $http_util->retorno("Sem permissão", false, 401);
                return;
            }

            $usuarios = $sql_usuarios->list_users(true, 10);
            if (!isset($usuarios)){
                $http_util->retorno("No Data", false, 400);
                return;
            }

            $array[] = []; $array = array_shift($array);
            foreach ($usuarios as $usuario) { array_push($array, $usuario->__toJson()); }
            $http_util->retorno($array, true, 200);
            //echo "<br /><br />encode: ".json_encode($array)."<br /><br />";
            return;
        }

        if ($tipo == 'tokenvalido'){
            $isadmin=$http_util->get_querystring_value("isadmin");
            $ok = $http_util->is_token_ok($sql_token, isset($isadmin) && filter_var($isadmin, FILTER_VALIDATE_BOOLEAN));
            $http_util->retorno([ "valido" => $ok ], true, $ok ? 200 : 405);
            return;
        }

        if ($tipo == 'verificado'){
            // -- ignorado pois o host gratuito não permite o envio de email --
            // atualizar o status de verificado do usuário - email enviado e etc
            // receber o uuid do usuário base 64
            // receber o login
            // validar o usuário pelo uuid e atualizar o status de verificado

        }

        $http_util->retorno("Erro", false, 401);
        return;
    }

    function tratar_post($http_util, $sql_usuarios, $sql_token){
        $tipo=$http_util->get_querystring_value("tipo");
        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;
        $tipos_validos = ['login', 'insert', 'excluir'];

        if (!isset($tipo) || !in_array($tipo, $tipos_validos)){
            $msg = !isset($tipo) ? "Informe o tipo" : "Tipo inválido (".(isset($tipo)?$tipo:"null").")";
            $http_util->retorno($msg, false, 404);
            return;
        }

        if ($tipo == 'login'){
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");

            if (!isset($login) || !isset($senha)){
                $http_util->retorno("Erro", false, 404); return;
            }

            //echo "login: {$login}<br />\r\n";
            //echo "senha: {$senha}<br />\r\n";

            $user = $sql_usuarios->do_login($login, $senha);
            if (!isset($user)){
                $http_util->retorno("Erro", false, 404); return;
            }

            $rt = $user->__toJson();
            $aux_token = $http_util->get_token($login, $senha, $sql_usuarios, $sql_token);
            if (isset($aux_token)){ $rt["token"] = $aux_token->__toJson(); }

            $http_util->retorno($rt, true, 200);
            return;
        }

        if ($tipo == 'insert'){

            // -- ignorado pois o host gratuito não permite o envio de email --
            // TODO: enviar email

            $nome = $http_util->get_body_value("nome");
            $login = $http_util->get_body_value("login");
            $senha = $http_util->get_body_value("senha");

            if (!isset($nome) || !isset($login) || !isset($senha)){
                $http_util->retorno("Erro", false, 404); return;
            }

            $user_add = new Usuario(null, $nome, null, $login, $senha, "0", "1");
            //echo "user_add: [{$user_add}]<br />\r\n";

            $rt = $sql_usuarios->insert_user($user_add);
            if (!isset($rt)){
                $http_util->retorno("Erro", false, 404); return;
            }
            if (!$rt["ok"]){
                $http_util->retorno($rt, true, 404); return;
            }

            if (isset($rt["usuario"])){
                $rt["usuario"] = $rt["usuario"]->__toJson();
            }
            $aux_token = $http_util->get_token($login, $senha, $sql_usuarios, $sql_token);
            if (isset($aux_token)){ $rt["token"] = $aux_token->__toJson(); }

            $http_util->retorno($rt, true, 201);return;
        }

        if ($tipo == 'excluir'){
            $authorizacao = $http_util->get_header_value("authorization");
            if (!isset($authorizacao) || !$http_util->is_token_ok($sql_token, false)){
                $http_util->retorno("Sem permissão", false, 401);
                return;
            }
            $authorizacao = base64_decode($authorizacao);
            #echo "authorizacao: {$authorizacao}<br />";
            $token = $sql_token->get_by_token($authorizacao);
            if (!isset($token)){ $http_util->retorno("Sem permissão", false, 401); return; }

            //echo "token: [{$token}]<br />";

            $uuid = $http_util->get_body_value("uuid");
            $id = $http_util->get_body_value("id");
            $login = $http_util->get_body_value("login");

            if (
                !isset($uuid) || !isset($id) || !isset($login) ||
                $id != $token->getId()
            ){ $http_util->retorno("Erro", false, 404); return; }

            // echo "uuid: {$uuid}<br />";
            // echo "id: {$id}<br />";
            // echo "login: {$login}<br />";

            $user = $sql_usuarios->get_user_byparams($uuid, $login, $id);
            if (!isset($user)){ $http_util->retorno("Erro", false, 404); return; }
            
            #echo "user: {$user}\r\n<br />";

            $rt = $sql_usuarios->ativar_inativar_usuario($user->getIdUsuario(), false);
            $msg = isset($rt["msg"]) ? $rt["msg"] : "Erro ao excluir o usuário: ".$user->getNome();
            if (!isset($rt) || !$rt["ok"]){ 
                $http_util->retorno($msg, false, 404); return; 
            }

            // excluir tokens deste usuário
            $sql_token->excluir_tokens_byid($id);

            $http_util->retorno($rt, true, 201);return;
        }

    }

    $http_util->retorno("", false, 401);
 
    
    /*
    -- listuser
    curl -i -X GET \
    -H "Authorization:ZGUxM2E0NTQwYjg3ZTBmODA2NWM3N2I1ODYwZjFjMjU=" \
    'http://192.168.0.4/helloworld/code/service/userservice/?tipo=listuser'


    -- tokenvalido - isadmin é opcional
    curl -i -X GET \
    -H "authorization:ZGUxM2E0NTQwYjg3ZTBmODA2NWM3N2I1ODYwZjFjMjU=" \
    'http://192.168.0.4/helloworld/code/service/userservice/?tipo=tokenvalido&isadmin=true'

    -- login
    curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{"login": "eme@gmail.com", "senha": "..." }' \
    'http://192.168.0.4/helloworld/code/service/userservice/?tipo=login'

    -- insert
    curl -i -X POST \
    -H "Content-Type:application/json" \
    -d '{"nome": "novo usuário","login": "new@gmail.com","senha": "123"}' \
    'http://192.168.0.4/helloworld/code/service/userservice/?tipo=insert'

    */
?>