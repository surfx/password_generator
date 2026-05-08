import {
    showMsg,
    addclick,
    showLoading,
    hideLoading
} from '../util/util.js';

let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnLogin = document.getElementById('btnLogin');
let spnMensagens = document.getElementById('spnMensagens');

function handleEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault(); 
        btnLogin.click();
    }
}

if (txtUsuario) {
    txtUsuario.addEventListener("keydown", handleEnter);
}
if (txtSenha) {
    txtSenha.addEventListener("keydown", handleEnter);
}

addclick(btnLogin, async () => {
    let user = txtUsuario.value;
    let senha = txtSenha.value;
    if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
    if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }

    showLoading(btnLogin, 'Entrando...');

    try {
        let resUser = await DataAux.loadUser(user, senha);
        if (!resUser) {
            showMsg(spnMensagens, "Usuário ou senha inválidos");
            return;
        }
        
        showMsg(spnMensagens, "Sucesso");
        // DataAux.loadUser already saves the user locally if found
        location.href = '../index.html';
    } catch (error) {
        console.error(error);
        showMsg(spnMensagens, "Erro: " + error.message);
    } finally {
        hideLoading(btnLogin);
    }
});

function verificarUsuarioLogado() {
    let usuario = DataAux.getUsuarioLogado();
    if (!usuario) { return; }

    let divLogin = document.getElementById('divLogin');
    !!divLogin && divLogin.remove();
    let divButtonLogin = document.getElementById('divButtonLogin');
    !!divButtonLogin && divButtonLogin.remove();
    let divDadosUsuario = document.getElementById('divDadosUsuario');
    if (!divDadosUsuario) { return; } divDadosUsuario.style = '';
    let divButtonSair = document.getElementById('divButtonSair');
    if (!divButtonSair) { return; } divButtonSair.style = '';

    let html =
        `<div>nome</div>
        <div>${usuario.nome}</div>
        <div>login</div>
        <div>${usuario.login}</div>
        <div>senha</div>
        <div>***</div>`;
    divDadosUsuario.innerHTML = html;

    let btnSair = document.getElementById('btnSair');
    if (!btnSair) { return; }
    addclick(btnSair, async () => {
        DataAux.deslogar();
        location.reload();
    });
}

document.body.onload = () => {
    verificarUsuarioLogado();
    
    let userField = document.getElementById('txtUsuario');
    if (userField) {
        userField.focus();
    }
};
