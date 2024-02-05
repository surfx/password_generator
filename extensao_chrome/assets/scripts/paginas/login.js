import {
    showMsg,
    addclick
} from '../util/util.js';

const server = new ServerPHP();

let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnLogin = document.getElementById('btnLogin');
let spnMensagens = document.getElementById('spnMensagens');

if (!!txtUsuario) { txtUsuario.focus(); }

addclick(btnLogin, async () => {
    let user = txtUsuario.value;
    let senha = txtSenha.value;
    if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
    if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }

    let res = await server.doLogin(user, senha);
    if (!res || !res.ok) {
        showMsg(spnMensagens, "Erro no login");
        return;
    }
    //console.log(res);
    if (!res || !res.ok) { console.log(res.toString()); return; }
    console.log(res.data.toString());

    showMsg(spnMensagens, "Sucesso");
    DataAux.saveUser(res.data);
    salvarSenhasLocais();
    verificarUsuarioLogado();

    // redireciona para a tela anterior
    location.href = '../index.html';

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
        `<div>id_usuario</div>
        <div>${usuario.id_usuario}</div>
        <div>nome</div>
        <div>${usuario.nome}</div>
        <div>login</div>
        <div>${usuario.login}</div>
        <div>senha</div>
        <div>***</div>
        <div>verificado</div>
        <div>${usuario.verificado}</div>`;
    divDadosUsuario.innerHTML = html;

    let btnSair = document.getElementById('btnSair');
    if (!btnSair) { return; }
    addclick(btnSair, async () => {
        DataAux.deslogar();
        location.reload();
    });
}

async function salvarSenhasLocais() {
    // salva/atualiza as senhas locais (browser) na base de dados
    let res = await DataAux.updateInsertSenhasLocais(server);
    // limpa as senhas locais
    if (!!res && !!res.ok) {
        DataAux.clearSenhasLocal();
    }
}

document.body.onload = () => {
    verificarUsuarioLogado();
};