<?php

class Criptografia {

    private $ciphering = "AES-128-CTR";
    private $options = 0;
    private $encryption_iv = '1234567891011121';
    private $encryption_key = "MyCryptPHP";

    public function __construct(
        $ciphering = "AES-128-CTR",
        $options = 0,
        $encryption_iv = '1234567891011121',
        $encryption_key = "MyCryptPHP"
    ) {
        $this->ciphering = $ciphering;

        $iv_length = openssl_cipher_iv_length($this->ciphering);
        $this->options = $options;
        $this->encryption_iv = $encryption_iv;
        $this->encryption_key = $encryption_key;

        if (isset($this->ciphering)){ $this->ciphering = "AES-128-CTR"; }
        if (isset($this->options)){ $this->options = 0; }
        if (isset($this->encryption_iv)){ $this->encryption_iv = '1234567891011121'; }
        if (isset($this->encryption_key)){ $this->encryption_key = "MyCryptPHP"; }
    }

    public function criptografar($texto){
        return openssl_encrypt(
            $texto, 
            $this->ciphering, 
            $this->encryption_key, 
            $this->options, 
            $this->encryption_iv);
    }

    public function decriptografar($texto_criptografado){
        return openssl_decrypt(
            $texto_criptografado,
            $this->ciphering,
            $this->encryption_key,
            $this->options,
            $this->encryption_iv);
    }

    // serialize(...)
    public function __toString() {
        return "ciphering: {$this->ciphering}, options: {$this->options}, ". 
                "encryption_iv: {$this->encryption_iv}, encryption_key: {$this->encryption_key} ";
    }

}
?>

<?php
// $cript = new Criptografia();

// Se usar as propriedades:
// $cript = new Criptografia($ciphering_prop, $options_prop, $encryption_iv_prop, $encryption_key_prop);

// $texto_plano = "Welcome to GeeksforGeeks";
// $texto_criptografado = $cript->criptografar($texto_plano);
// $texto_volta = $cript->decriptografar($texto_criptografado);

// echo "texto_plano: $texto_plano<br />";
// echo "texto_criptografado: $texto_criptografado<br />";
// echo "texto_volta: $texto_volta<br />";
?>