import {
    showMsg
} from '../util/util.js';
// import './../serverphp/serverPHP.js';

//http://127.0.0.1:5500/assets/scripts/paginas/assets/scripts/serverphp/serverPHP.js
//http://127.0.0.1:5500/assets/scripts/serverphp/serverPHP.js

/* <script src="../serverphp/serverPHP.js"></script> */

// http://127.0.0.1:5500/assets/scripts/paginas/util/util.js

//http://127.0.0.1:5500/assets/scripts/util/util.js

const server = new ServerPHP();

let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnLogin = document.getElementById('btnLogin');
let spnMensagens = document.getElementById('spnMensagens');

function addclick(obj, fn) { if (!obj || !fn) { return; } obj.addEventListener("click", function () { fn(); }); }

if (!!txtUsuario) { txtUsuario.focus(); }

addclick(btnLogin, async () => {
    let user = txtUsuario.value;
    let senha = txtSenha.value;
    if (!user){ showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
    if (!senha){ showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }
    
    let res = await server.doLogin(user, senha);
    if (!res || !res.ok){
        showMsg(spnMensagens, "Erro no login");
        return;
    }
    //console.log(res);
    if (!res || !res.ok) { console.log(res.toString()); return; }
    console.log(res.data.toString());

    showMsg(spnMensagens, "Sucesso");

});