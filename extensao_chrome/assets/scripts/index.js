import {
    getUrl, copyToClipboard, showMsg
} from './util/util.js';

import {
    saveDataSenhas, recuperarDataSenhas, recuperarDataSenhasDominio,
    excluirSenha
} from './util/dataSenhas.js';

import {
    gerarSenha
} from './passwordgen/pasword_generator.js';

let txtSearch = document.getElementById("txtSearch");
let divDominio = document.getElementById('divDominio');
let divSenhasSalvas = document.getElementById('divSenhasSalvas');

let spnMensagens = document.getElementById('spnMensagens');

if (!!txtSearch) {
    txtSearch.focus();
    txtSearch.addEventListener("input", function (e) {
        let filtro = txtSearch.value;
        if (!filtro || filtro.length <= 0) {
            loadDataSenhas();
            return;
        }
        retrieveData(filtro).then(data => { tratarDataHTMLSenhas(data); });
    });
}



let urlRecuperada = '';
getUrl(false).then(url => {
    urlRecuperada = url;
    !!divDominio && (divDominio.innerHTML = `site: ${urlRecuperada}`);
});

export const retrieveData = (filtroUsuario) => {
    return new Promise((resolve, reject) => {
        getUrl(false).then(url => {
            resolve(recuperarDataSenhasDominio(url, filtroUsuario));
        });
    });
}


function templateUsuariosSenhas(i, data) {
    if (!data) { return ''; }
    return `<div>${data.usuario}</div>
    <div>
        <button class="btnCopy" id="btnCopyUser${i}"></button>
    </div>
    <div>*****...</div>
    <div>
        <button class="btnCopy" id="btnCopyPassword${i}"></button>
    </div>
    <div>
        <button class="btnExcluir" id="btnExcluirPassword${i}"></button>
    </div>`;
}

function tratarDataHTMLSenhas(data){
    divSenhasSalvas.innerHTML = '';
    let size = data.length;
    for (let i = 0; i < size; i++) {
        divSenhasSalvas.innerHTML += templateUsuariosSenhas(i, data[i]);
    }

    // handlers
    for (let i = 0; i < size; i++) {
        let btnCopyUser = document.getElementById('btnCopyUser' + i);
        btnCopyUser.addEventListener("click", function () {
            copyToClipboard(data[i].usuario);
            showMsg(spnMensagens, 'Usuário copiado');
        });
        let btnCopyPassword = document.getElementById('btnCopyPassword' + i);
        btnCopyPassword.addEventListener("click", function () {
            copyToClipboard(data[i].senha);
            showMsg(spnMensagens, 'Senha copiada');
        });
        let btnExcluirPassword = document.getElementById('btnExcluirPassword' + i);
        btnExcluirPassword.addEventListener("click", function () {
            if (!window.confirm("Deseja excluir a senha? [" + data[i].usuario + "]")) { return; }
            if (excluirSenha(data[i].dominio, data[i].usuario)) {
                showMsg(spnMensagens, 'Usuário ' + data[i].usuario + ' excluído');
            } else {
                showMsg(spnMensagens, 'Erro ao excluir o usuário: ' + data[i].usuario);
            }
            loadDataSenhas();

        });
    }
}

function loadDataSenhas() {
    retrieveData(undefined).then(data => { tratarDataHTMLSenhas(data); });
}

if (!!divSenhasSalvas) { loadDataSenhas(); }


let btnSaveAddSenhas = document.getElementById('btnSaveAddSenhas');
if (!!btnSaveAddSenhas) {

    btnSaveAddSenhas.addEventListener("click", function () {
        let txtAddUsuario = document.getElementById('txtAddUsuario');
        let txtAddSenha = document.getElementById('txtAddSenha');
        let userAdd = !!txtAddUsuario ? txtAddUsuario.value : undefined;
        let senhaAdd = !!txtAddSenha ? txtAddSenha.value : undefined;

        if (!userAdd || !senhaAdd) {
            showMsg(spnMensagens, 'Informe o usuário e a senha');
            if (!userAdd) txtAddUsuario.focus();
            else if (!senhaAdd) txtAddSenha.focus();
            return;
        }

        if (!window.confirm("Deseja salvar a senha?")) { return; }
        txtAddUsuario.value = '';
        txtAddSenha.value = '';

        saveDataSenhas({ usuario: userAdd, senha: senhaAdd, dominio: urlRecuperada });

        showMsg(spnMensagens, 'Senha Salva');

        loadDataSenhas();
    });
}

let btnRefreshSenha = document.getElementById('btnRefreshSenha');
if (!!btnRefreshSenha){
    btnRefreshSenha.addEventListener("click", function () {
        txtAddSenha.value = gerarSenha(15, true, true, true, true);
    });
}