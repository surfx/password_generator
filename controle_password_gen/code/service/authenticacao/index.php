<?php

    // Métodos de autenticação

    include '../../propriedades/propriedades.php';
    include '../../util/http_util.php';

    include '../../bd/entidades/token.php';
    include '../../bd/base_dados_aux.php';
    include '../../bd/tokens/sql_tokens.php';
    include '../..//bd/relacoes/sql_usuarios.php';
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
        default: $http_util->retorno("Erro método não permitido: ".$method, false, 404);
    }
?>

<?php

    //obs: usuario_login e senha estão em base 64
    function tratar_post($http_util, $sql_usuarios, $sql_token){
        if (!isset($http_util) || !isset($sql_usuarios)){ $http_util->retorno("[1] Erro método não permitido", false, 404); return; }
        $usuario_login=$http_util->get_header_value('usuario');
        $senha=$http_util->get_header_value('senha');
        if (!isset($usuario_login) || !isset($senha)){$http_util->retorno("[2] Erro método não permitido", false, 404); return;}
        $usuario_login = base64_decode($usuario_login);
        $senha = base64_decode($senha);
        $usuario = $sql_usuarios->do_login($usuario_login, $senha);
        if (!isset($usuario)){$http_util->retorno("Usuário inválido", false, 404); return;}

        //echo "user: ".$usuario_login.", pass: ".$senha."<br />";
        //echo "usuario: ".$usuario."<br />";

        $token = $sql_token->get_token($usuario->getIdUsuario());
        if (isset($token)){
            //echo "possui token ativo: ".$token."<br />";
            //echo "json: ".json_encode($token->__toJson())."<br />";
            $http_util->retorno($token->__toJson(), true, 200);
            return;
        }

        $token_text = bin2hex(random_bytes(16));
        //echo "token_text: ".$token_text."<br>";

        $token = new Token($usuario->getIdUsuario(), $token_text);
        $rt = $sql_token->insert_token($token);

        if (!isset($rt) || !isset($rt["ok"]) || !$rt["ok"] || !isset($rt["token"])) {
            $http_util->retorno("[2] Erro ao salvar o token [".$token."], mgs: ".$rt["msg"], false, 402);
            return;
        }

        //echo "Token salvo: ".$rt["msg"].", token: ".$rt["token"];
        $http_util->retorno($rt["token"]->__toJson(), true, 200);

    }
?>