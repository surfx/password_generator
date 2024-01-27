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
        default: $http_util->retorno_erro("Erro método não permitido: ".$method, 404);
    }
?>

<?php

    function tratar_post($http_util, $sql_usuarios, $sql_token){
        if (!isset($http_util) || !isset($sql_usuarios)){ $http_util->retorno_erro("[1] Erro método não permitido", 404); return; }
        $login = $http_util->get_body_value("login");
        $senha = $http_util->get_body_value("senha");
        if (!isset($login) || !isset($senha)){$http_util->retorno_erro("[2] Erro método não permitido", 404); return;}
        //$login = base64_decode($login); $senha = base64_decode($senha);
        $usuario = $sql_usuarios->do_login($login, $senha);
        if (!isset($usuario)){$http_util->retorno_erro("Usuário inválido", 404); return;}

        //echo "user: ".$login.", pass: ".$senha."<br />";
        //echo "usuario: ".$usuario."<br />";

        $token = $sql_token->get_token($usuario->getIdUsuario());
        if (isset($token)){
            //echo "possui token ativo: ".$token."<br />";
            //echo "json: ".json_encode($token->__toJson())."<br />";
            $http_util->retorno( ["ok" => true, "data" => $token->__toJson()] , true, 200);

            return;
        }

        $token_text = bin2hex(random_bytes(16));
        //echo "token_text: ".$token_text."<br>";

        $token = new Token($usuario->getIdUsuario(), $token_text);
        $rt = $sql_token->insert_token($token);

        if (!isset($rt) || !isset($rt["ok"]) || !$rt["ok"] || !isset($rt["token"])) {
            $http_util->retorno_erro("[2] Erro ao salvar o token [".$token."], mgs: ".$rt["msg"], 402);
            return;
        }

        //echo "Token salvo: ".$rt["msg"].", token: ".$rt["token"];
        $http_util->retorno( ["ok" => true, "data" => $rt["token"]->__toJson()] , true, 200);

    }
    
?>