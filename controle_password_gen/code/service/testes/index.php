<?php

    include '../../util/http_util.php';
    $http_util = new HTTPUtil();

    //-----------------------------------
    $method=$http_util->get_request_method();
    $method=isset($method)?strtolower(trim($method)):"";

    switch($method){
        case 'get': case 'post': default: tratar_get($http_util);
    }

    function tratar_get($http_util){
        $tipo=$http_util->get_querystring_value("tipo");
        $tipo = isset($tipo) ? strtolower(trim($tipo)) : null;

        header_remove('Set-Cookie');
        header('Content-Type: application/json');

        // header('Access-Control-Allow-Origin: *');
        // header('Access-Control-Allow-Methods: GET, POST');
        // header('Access-Control-Allow-Headers: X-Requested-With');

        $array = ["1", "2", "3", $tipo];
        //echo json_encode($array); exit;

        $http_util->retorno($array, true, 200);

    }
?>