<?php

// define("PROJECT_ROOT_PATH", __DIR__ . "/../");


// $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// echo "uri: '".$uri."'<br>";

// $queryString=$_SERVER['QUERY_STRING'];

// echo "queryString: '".$queryString."'<br><br>";


// $queries = array();
// parse_str($_SERVER['QUERY_STRING'], $queries);
// echo "----------------------------------<br />";
// foreach ($queries as $x) {
//     echo "$x <br>";
// }

// echo "----------------------------------<br />";
// foreach ($queries as $x => $y) {
//     echo "$x : $y <br>";
// }
// // $uri = explode('/', $uri );
// // if ((isset($uri[2]) && $uri[2] != 'user') || !isset($uri[3])) {
// //     // header("HTTP/1.1 404 Not Found");
// //     // exit();
// //     echo "TESTES";
// // }


// // require PROJECT_ROOT_PATH . "/controller/UserController.php";
// // $objFeedController = new UserController();
// // $strMethodName = $uri[3] . 'Action';
// // $objFeedController->{$strMethodName}();
?>


<?php
function sendOutput($data, $httpHeaders=array())
{
    header_remove('Set-Cookie');
    if (is_array($httpHeaders) && count($httpHeaders)) {
        foreach ($httpHeaders as $httpHeader) {
            header($httpHeader);
        }
    }
    echo $data;
    exit;
}

//json_encode(

$myArr = array("John", "Mary", "Peter", "Sally", $_SERVER['REQUEST_METHOD']);

sendOutput(
    json_encode($myArr),
    array('Content-Type: application/json', 'HTTP/1.1 200 OK')
);
?>