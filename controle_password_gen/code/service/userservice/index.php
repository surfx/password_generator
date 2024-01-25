<?php

    include '../../propriedades/propriedades.php';
    include '../../util/http_util.php';
    include '../../bd/base_dados_aux.php';
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
    
    //-----------------------------------
    $method=$http_util->get_request_method();
    $method=isset($method)?strtolower(trim($method)):"";


    switch($method){
        case 'get': default: tratar_get($http_util, $sql_usuarios);
    }
?>

<?php
    function tratar_get($http_util, $sql_usuarios){
        $tipo=$http_util->get_querystring_value("tipo");

        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;
        $tipos_validos = ['getuser', 'listuser'];

        if (!isset($tipo) || !in_array($tipo, $tipos_validos)){
            $msg = !isset($tipo) ? "Informe o tipo" : "Tipo inválido (".(isset($tipo)?$tipo:"null").")";
            retorno($msg, false, $http_util, 404);
        }

        // recuperar os 10 primeiros ativos
        if ($tipo == 'listuser'){
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

        echo "<br><br><br>GET";

        //retorno("EEMERSON", false, $http_util, 200);

    }
    //echo "<br /><br />".get_http_status_code(400)."<br /><br />";

    // retorno("", false, $http_util, 401);
    
?>