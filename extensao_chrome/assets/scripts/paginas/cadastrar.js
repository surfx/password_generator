import {
    showMsg,
    addclick
} from '../util/util.js';

const server = new ServerPHP();

let txtNome = document.getElementById('txtNome');
let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnCadastrar = document.getElementById('btnCadastrar');
let spnMensagens = document.getElementById('spnMensagens');


document.body.onload = () => { 
    if (!!txtNome) { txtNome.focus(); }

    addclick(btnCadastrar, async () => {
        showMsg(spnMensagens, "Teste de cadastro");
    });
};