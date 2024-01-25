<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Generator</title>

  <?php
    include 'code/propriedades/propriedades.php';
    include 'code/criptografia/criptografia.php';
    include 'code/bd/base_dados_aux.php';
    include 'code/bd/relacoes/sql_usuarios.php';
  ?>

</head>
<body>
  
  <h1>Password generator</h1>

  <h2>Métodos</h2>

  <ul>
    <li>
      <b>list top 10 users:</b>
      curl -i -k -X GET http://192.168.0.4/helloworld/code/service/userservice/?tipo=listuser
    </li>
  </ul>

  <?php
    $bd = new BaseDadosAux(
        $mysql_servername,
        $mysql_username,
        $mysql_password,
        $mysql_dbname
    );
    //echo $bd->__toString();

    $cript = new Criptografia();

    $sql_usuarios = new SQLUsuarios($bd, $cript);


    $usuario = $sql_usuarios->do_login("master123@master.com", "b6K+x!nasGfaCDk");
    if (isset($usuario)){
      echo $usuario."<br>";
    }

    //-- insert_user
    // $id_usuario = "",
    // $nome = "",
    // $uuid = "",
    // $login = "",
    // $senha = "",
    // $verificado = "",
    // $ativo = "",
    $usuario = new Usuario(null, "emerson", null, "eme@gmail.com", "123", "1", "1");
    $rt = $sql_usuarios->insert_user($usuario);
    if (isset($rt["ok"]) && $rt["ok"]){
      echo "Usuário inserido com sucesso: ".$rt["usuario"];
    } else {
      echo "erro ao inserir o usuário: ".$rt["usuario"];;
    }
  ?>
</body>
</html>