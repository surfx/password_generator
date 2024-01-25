<?php

class HTTPUtil {

    public function __construct(
    ) {

    }

    public function get_headers(){
        return apache_request_headers();
    }

    public function get_header_value($key){
        if (!isset($key)){return null;}
        $header_aux = $this->get_headers();
        return isset($header_aux) && isset($header_aux[$key]) ? $header_aux[$key] : null;
    }

    public function get_body($as_json = true){
        $data_body_aux = file_get_contents('php://input');
        if (!isset($data_body_aux)){ return null; }
        return isset($as_json) ? json_decode($data_body_aux, true) : $data_body_aux;
    }

    public function get_body_value($key){
        if (!isset($key)){return null;}
        $data_body_aux = $this->get_body(true);
        return isset($data_body_aux) && isset($data_body_aux[$key]) ? 
                $data_body_aux[$key] : null;
    }

    public function get_request_method(){
        return $_SERVER["REQUEST_METHOD"]; //GET, POST, PUT, etc
    }

    public function get_querystring(){
        $queries = array();
        parse_str($_SERVER['QUERY_STRING'], $queries);
        return $queries;
    }

    public function get_querystring_value($key){
        if (!isset($key)){return null;}
        $qs_aux = $this->get_querystring();
        return isset($qs_aux) && isset($qs_aux[$key]) ? $qs_aux[$key] : null;
    }

    public function get_uri_segments() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $uri = explode( '/', $uri );
        return $uri;
    }

    //-------------------
    public function send_output($data, $httpHeaders=array()) {
        header_remove('Set-Cookie');
        if (is_array($httpHeaders) && count($httpHeaders)) {
            foreach ($httpHeaders as $httpHeader) {
                header($httpHeader);
            }
        }
        echo $data;
        exit;
    }

    public function get_http_status_code($http_status = 200){
        switch(intval($http_status)){
            case 400: case 401: case 402: case 403:
            case 404: return 'HTTP/1.1 '.$http_status.' Not Found';
            case 200: default: return 'HTTP/1.1 '.$http_status.' OK';
        }
    }

    public function retorno($data, $is_json, $http_status = 200){
        $this->send_output(
            isset($data) ? ($is_json ? json_encode($data) : $data) : "",
            array('Content-Type: '.($is_json ? 'application/json': 'text/plain'), 
            $this->get_http_status_code($http_status))
        );
    }

}
?>

<?php

// foreach ($headers as $header => $value) { echo "$header: $value <br />\n"; }
// ---------------------------------------

// $http_util = new HTTPUtil();
// echo "Host: ".$http_util->get_header_value('Host')."<br />";
// echo "accept: ".$http_util->get_header_value('accept')."<br />";
// echo "teste: ".$http_util->get_header_value('teste')."<br />";

// echo "<br><br>";

// echo "asd: ".$http_util->get_body_value('asd')."<br />";
// echo "item: ".$http_util->get_body_value('item')."<br />";

// echo "<br><br>";

// echo "get_request_method: ".$http_util->get_request_method()."<br />";
// echo "get_querystring_value('chave1'): ".$http_util->get_querystring_value('chave1')."<br />";

// $uri_segm = $http_util->get_uri_segments();
// print_r($uri_segm);

// ---------------------------------------
// Exemplo de send_output para um erro

//     $http_util->send_output(json_encode(array('error' => $strErrorDesc)), 
//         array('Content-Type: application/json', $strErrorHeader)
//     );

// Exemplo para dados

//     $myArr = array("John", "Mary", "Peter", "Sally", $_SERVER['REQUEST_METHOD']);

//     $http_util->send_output(
//         json_encode($myArr),
//         array('Content-Type: application/json', 'HTTP/1.1 200 OK')
//     );
?>