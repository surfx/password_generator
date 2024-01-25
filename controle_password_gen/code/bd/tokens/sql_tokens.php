<?php

class SQLToken {

    private $_base_aux; // BaseDadosAux

    public function __construct(
        $base_aux
    ) {
        $this->_base_aux = $base_aux;
    }

    public function get_token($id){
        if (!isset($this->_base_aux) || 
            !isset($id)){return null;}

        $sql = "SELECT id, token, validade FROM tokens ".
               "WHERE id = ".$id." AND validade >= CURRENT_TIMESTAMP ".
               "LIMIT 1";

        $tokens = $this->_base_aux->get_result($sql, function($row) { return $this->converter_token($row); });
        if (!isset($tokens) || count($tokens) <= 0){return null;}
        return $tokens[0];
    }

    public function insert_token($token){
        $rt = array("ok" => false, "msg" => "", "token" => null);
        if (!isset($token) || !isset($this->_base_aux)){
            $rt["msg"] = "Token inválido";
            return $rt;
        }

        $rt = $this->validar_token($token);
        if (!$rt["ok"]){return $rt;}

        $token_byid = $this->get_token($token->getId());
        if (isset($token_byid)){
            $rt["ok"] = false;
            $rt["msg"] = "Já existe token ativo: ".$token_byid;
            $rt["token"] = $token_byid;
            return $rt;
        }

        // exclui os demais tokens do usuário, pois estão expirados
        $sql = "DELETE FROM tokens WHERE id = ".$token->getId();
        $this->_base_aux->execute_sql($sql);

        // echo $sql."<br><br>";

        // 15 horas de validade
        $sql = "INSERT INTO tokens (id, token, validade) VALUES (".
                $token->getId().", '".$token->getToken()."', ".
                "date_add(CURRENT_TIMESTAMP, interval 15 HOUR))";
        
        // echo $sql."<br><br>";

        $rt["ok"] = $this->_base_aux->execute_sql($sql);
        $rt["msg"] = "sucesso";
        $rt["token"] = $this->get_token($token->getId());
        return $rt;
    }


    private function validar_token($token){
        $rt = array("ok" => false, "msg" => "", "token" => $token);
        if (!isset($token)){return $rt;}
        $rt["ok"] = true;

        $id = $token->getId();
        $token_value = $token->getToken();

        $id = isset($id) ? trim($id) : null;
        $token_value = isset($token_value) ? trim($token_value) : null;

        if (!isset($id) || strlen($id) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Id inválido";
            return $rt;
        }
        if (!isset($token_value) || strlen($token_value) <= 0){
            $rt["ok"] = false;
            $rt["msg"] = "Token inválido";
            return $rt;
        }
        return $rt;
    }

    private function converter_token($row){
        if (!isset($row)){return null;}
        return new Token(
            $row["id"],
            $row["token"],
            $row["validade"]
        );
    }
}
?>