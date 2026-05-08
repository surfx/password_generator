import {
    showMsg,
    addclick,
    showLoading,
    hideLoading
} from '../util/util.js';

let txtNome = document.getElementById('txtNome');
let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnEditarUsuario = document.getElementById('btnEditarUsuario');
let spnMensagens = document.getElementById('spnMensagens');

document.body.onload = async () => {
    if (!!txtNome) { txtNome.focus(); }

    let usuario = DataAux.getUsuarioLogado();
    if (!usuario || !usuario.id_usuario) {
        location.href = '../index.html';
        return;
    }

    txtNome.value = usuario.nome;
    txtUsuario.value = usuario.login;
    txtSenha.value = usuario.senha;

    addclick(btnEditarUsuario, async () => {
        let nome = txtNome.value;
        let user = txtUsuario.value;
        let senha = txtSenha.value;
        
        if (!nome) { showMsg(spnMensagens, "Informe o nome"); txtNome.focus(); return; }
        if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
        if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }
        
        usuario.nome = nome;
        usuario.login = user;
        usuario.senha = senha;

        showLoading(btnEditarUsuario, 'Salvando...');

        try {
            await DataAux.saveUser(usuario);
            showMsg(spnMensagens, "Dados alterados com sucesso");
            setTimeout(() => location.href = '../index.html', 1000);
        } catch (e) {
            showMsg(spnMensagens, "Erro: " + e.message);
        } finally {
            hideLoading(btnEditarUsuario);
        }
    });
};
