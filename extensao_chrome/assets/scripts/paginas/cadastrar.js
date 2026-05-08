import {
    showMsg,
    addclick,
    showLoading,
    hideLoading
} from '../util/util.js';

let txtNome = document.getElementById('txtNome');
let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnCadastrar = document.getElementById('btnCadastrar');
let spnMensagens = document.getElementById('spnMensagens');


document.body.onload = () => { 
    if (!!txtNome) { txtNome.focus(); }

    addclick(btnCadastrar, async () => {

        let nome = txtNome.value;
        let user = txtUsuario.value;
        let senha = txtSenha.value;
        if (!nome) { showMsg(spnMensagens, "Informe o nome"); txtNome.focus(); return; }
        if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
        if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }

        showLoading(btnCadastrar, 'Cadastrando...');

        try {
            let res = await DataAux.registerUser(nome, user, senha);
            if (!res || !res.ok) {
                showMsg(spnMensagens, res.msg || 'Erro no cadastro');
                return;
            }

            showMsg(spnMensagens, res.msg);
            location.href = '../index.html';
        } catch (e) {
            showMsg(spnMensagens, "Erro: " + e.message);
        } finally {
            hideLoading(btnCadastrar);
        }

    });

};
