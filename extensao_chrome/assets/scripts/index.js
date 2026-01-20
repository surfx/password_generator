import {
    getUrl, copyToClipboard, showMsg,
    addclick
} from './util/util.js';

import {
    gerarSenha
} from './passwordgen/pasword_generator.js';


// const server = new ServerPHP();
// const server = new ServerPython();

let allPasswords = []; // Armazena todas as senhas carregadas para filtro local

let txtSearch = document.getElementById("txtSearch");
let divDominio = document.getElementById('divDominio');
let divSenhasSalvas = document.getElementById('divSenhasSalvas');

let spnMensagens = document.getElementById('spnMensagens');

if (!!txtSearch) {
    txtSearch.focus();
    txtSearch.addEventListener("input", () => {
        let filtro = txtSearch.value.toLowerCase();
        let items = divSenhasSalvas.getElementsByClassName('password-item');
        
        for (let item of items) {
            let userDiv = item.querySelector('.user-text');
            if (userDiv) {
                let login = userDiv.textContent.toLowerCase();
                if (login.includes(filtro)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }
        }
    });
}

let btnClearSearchSenhas = document.getElementById('btnClearSearchSenhas');
if (!!btnClearSearchSenhas) {
    btnClearSearchSenhas.addEventListener("click", function () {
        txtSearch.value = '';
        let items = divSenhasSalvas.getElementsByClassName('password-item');
        for (let item of items) {
            item.style.display = '';
        }
        txtSearch.focus();
    });
}

let urlRecuperada = '';
getUrl(false).then(url => {
    urlRecuperada = url;
    !!divDominio && (divDominio.innerHTML = `site: ${urlRecuperada}`);
    loadSenhas();
});

/* Removido retrieveData e recuperarDataSenhasDominio que causavam erro */


function templateUsuariosSenhas(i, data) {
    if (!data) { return ''; }
    return `<div class="password-item">
        <div class="user-text" title="${data.login}">${data.login}</div>
        <div>
            <button class="btnCopy" id="btnCopyUser${i}" title="Copiar Usuário">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div class="pass-text">••••••••</div>
        <div>
            <button class="btnCopy" id="btnCopyPassword${i}" title="Copiar Senha">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
        </div>
        <div>
            <button class="btnLoginAuto" id="btnLoginAuto${i}" title="Login Automático">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
            </button>
        </div>
        <div>
            <button class="btnExcluir" id="btnExcluirPassword${i}" title="Excluir">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    </div>`;
}

function tratarDataHTMLSenhas(data) {
    divSenhasSalvas.innerHTML = '';
    if (!data) { return; }
    let size = data.length;
    for (let i = 0; i < size; i++) {
        divSenhasSalvas.innerHTML += templateUsuariosSenhas(i, data[i]);
    }

    // handlers
    for (let i = 0; i < size; i++) {
        let btnCopyUser = document.getElementById('btnCopyUser' + i);
        btnCopyUser.addEventListener("click", function () {
            copyToClipboard(data[i].login);
            showMsg(spnMensagens, 'Usuário copiado');
        });
        let btnCopyPassword = document.getElementById('btnCopyPassword' + i);
        btnCopyPassword.addEventListener("click", function () {
            copyToClipboard(data[i].senha);
            showMsg(spnMensagens, 'Senha copiada');
        });
        
        let btnLoginAuto = document.getElementById('btnLoginAuto' + i);
        if (btnLoginAuto) {
            btnLoginAuto.addEventListener("click", function() {
                enviarLoginParaAutomacao(data[i]);
            });
        }

        let btnExcluirPassword = document.getElementById('btnExcluirPassword' + i);
        btnExcluirPassword.addEventListener("click", async function () {
            if (!window.confirm("Deseja excluir a senha? [" + data[i].login + "]")) { return; }
            let res = await DataAux.excluirSenha(data[i]);
            if (!res || !res.ok) {
                showMsg(spnMensagens, !!res && !!res.msg ? res.msg : 'Erro ao excluir o usuário: ' + data[i].login);
                return;
            }
            showMsg(spnMensagens, 'Usuário ' + data[i].login + ' excluído');
            loadSenhas();
        });
    }
}

function enviarLoginParaAutomacao(senhaObj) {
    // Converte para POJO se necessário
    let credencial = senhaObj;
    if (senhaObj.constructor.name === 'Senha' || typeof senhaObj.toJsonSerialize === 'function') {
        credencial = {
            id_senha: senhaObj.id_senha,
            id_usuario: senhaObj.id_usuario,
            dominio: senhaObj.dominio,
            login: senhaObj.login,
            senha: senhaObj.senha
        };
    }
    
    // Salva no storage para disparar o evento no content script
    if (typeof chrome !== 'undefined' && chrome && chrome.storage && chrome.storage.local) {
        // Timestamp force change detection
        credencial._timestamp = new Date().getTime();
        chrome.storage.local.set({ "login_automatico": credencial }, () => {
             showMsg(spnMensagens, 'Login enviado...');
        });
    }
}

//if (!!divSenhasSalvas) { loadSenhas(); }


let btnSaveAddSenhas = document.getElementById('btnSaveAddSenhas');
if (!!btnSaveAddSenhas) {

    btnSaveAddSenhas.addEventListener("click", async function () {
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

        let res = await saveSenha(userAdd, senhaAdd);
        //console.log(res);
        if (!res || !res.ok) {
            showMsg(spnMensagens, !!res && !!res.msg ? res.msg : "Erro ao salvar a senha");
            return;
        }

        txtAddUsuario.value = '';
        txtAddSenha.value = '';

        //saveDataSenhas({ usuario: userAdd, senha: senhaAdd, dominio: urlRecuperada });

        showMsg(spnMensagens, 'Senha Salva');

        //loadDataSenhas();
        loadSenhas();
    });
}

let btnRefreshSenha = document.getElementById('btnRefreshSenha');
if (!!btnRefreshSenha) {
    btnRefreshSenha.addEventListener("click", function () {
        let txtAddSenha = document.getElementById('txtAddSenha');
        if (!!txtAddSenha) { txtAddSenha.value = gerarSenha(15, true, true, true, true); }
    });
}

// -------------------------
// Tool Password generator
// -------------------------

// Slider

let slider = document.getElementById("mySlider");
let output = document.getElementById("spnValorSlider");
output.innerHTML = slider.value; // Display the default slider value

let chkNumeros = document.getElementById('chkNumeros');
let chkCaracteresEspeciais = document.getElementById('chkCaracteresEspeciais');
let chkMaiusculas = document.getElementById('chkMaiusculas');
let chkMinusculas = document.getElementById('chkMinusculas');

let txtPassswordGen = document.getElementById('txtPassswordGen');
function refreshSenha() {
    if (!txtPassswordGen) { return; }
    let size = slider.value;


    //size, addNumeros, addCaracteresEspeciais, addMaiusculas, addMinusculas

    if (size <= 0) { size = 15; }
    txtPassswordGen.value = gerarSenha(
        size,
        chkNumeros.checked,
        chkCaracteresEspeciais.checked,
        chkMaiusculas.checked,
        chkMinusculas.checked
    );
}

chkCaracteresEspeciais.onchange = refreshSenha;
chkNumeros.onchange = refreshSenha;
chkMaiusculas.onchange = refreshSenha;
chkMinusculas.onchange = refreshSenha;

refreshSenha();

let btnCopyPassswordGen = document.getElementById('btnCopyPassswordGen');
if (!!btnCopyPassswordGen) {
    btnCopyPassswordGen.addEventListener("click", function () {
        copiarParaAreaTransferencia();
    });
}

let btnRefreshPassswordGen = document.getElementById('btnRefreshPassswordGen');
if (!!btnRefreshPassswordGen) {
    btnRefreshPassswordGen.addEventListener("click", function () {
        refreshSenha();
    });
}

function copiarParaAreaTransferencia() {
    if (!txtPassswordGen) { return; }
    if (!txtPassswordGen.value || txtPassswordGen.value.length <= 0) {
        showMsg(spnMensagens, 'Senha vazia');
        return;
    }
    copyToClipboard(txtPassswordGen.value);
    showMsg(spnMensagens, 'Senha copiada');
}

// Slider
slider.oninput = function () {
    output.innerHTML = this.value;
    refreshSenha();
}


document.getElementById('btnCopiar').onclick = copiarParaAreaTransferencia;

function deslogar() { DataAux.deslogar(); location.reload(); }

async function verificarUsuarioLogado() {
    let usuario = DataAux.getUsuarioLogado();
    if (!usuario) { return; }

    // Verifica token no servidor
    let tokenValido = await DataAux.verificarTokenOnline();
    if (!tokenValido) {
        deslogar();
        return;
    }

    let divLinkActionsCenter = document.getElementById('divLinkActionsCenter');
    if (!!divLinkActionsCenter) { divLinkActionsCenter.remove(); }

    let divDeslogarLink = document.getElementById('divDeslogarLink');
    if (!!divDeslogarLink) { divDeslogarLink.style = ''; }

    let linkDeslogar = document.getElementById('linkDeslogar');
    if (!!linkDeslogar) { addclick(linkDeslogar, () => { deslogar(); }); }

    let divBemVindo = document.getElementById('divBemVindo');
    if (!!divBemVindo) {
        divBemVindo.style = '';
        divBemVindo.innerHTML = `<div>
            <svg width="12px" height="12px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#dc143c">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            ${usuario.nome}
        </div>
        <div><a href="#" id="linkBemVindoSair">Sair</a></div>`;
    }

    let linkBemVindoSair = document.getElementById('linkBemVindoSair');
    if (!!linkBemVindoSair) { addclick(linkBemVindoSair, () => { deslogar(); }); }
}

async function saveSenha(login, senha) {
    return await DataAux.saveSenha(login, senha, urlRecuperada);
}

async function loadSenhas() {
    divSenhasSalvas.innerHTML = '';
    let auxSenhas = await DataAux.loadSenhas(urlRecuperada);
    if (!auxSenhas || !auxSenhas.ok || !auxSenhas.data) { 
        allPasswords = [];
        return; 
    }
    allPasswords = auxSenhas.data;
    tratarDataHTMLSenhas(allPasswords);
}

document.body.onload = () => {
    verificarUsuarioLogado();
};

