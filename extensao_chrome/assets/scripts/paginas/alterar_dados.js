import {
    showMsg,
    addclick
} from '../util/util.js';

// const server = new ServerPHP();
const server = new ServerNative();

let txtNome = document.getElementById('txtNome');
let txtUsuario = document.getElementById('txtUsuario');
let txtSenha = document.getElementById('txtSenha');
let btnEditarUsuario = document.getElementById('btnEditarUsuario');
let spnMensagens = document.getElementById('spnMensagens');
let btnInativarUsuario = document.getElementById('btnInativarUsuario');

document.body.onload = async () => {
    if (!!txtNome) { txtNome.focus(); }

    let usuario = DataAux.getUsuarioLogado();
    if (!usuario || !usuario.id_usuario) {
        location.href = '../index.html';
        return;
    }

    // Valida token online
    let tokenValido = await DataAux.verificarTokenOnline();
    if (!tokenValido) {
        location.href = '../index.html';
        return;
    }

    txtNome.value = usuario.nome;
    txtUsuario.value = usuario.login;
    txtSenha.value = usuario.senha;

    //console.log('usuario: ', usuario);

    addclick(btnEditarUsuario, async () => {
        let nome = txtNome.value;
        let user = txtUsuario.value;
        let senha = txtSenha.value;
        
        if (!nome) { showMsg(spnMensagens, "Informe o nome"); txtNome.focus(); return; }
        if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
        if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }
        
        if (!usuario || !usuario.token || !usuario.token.tokenToBase64()) {
            showMsg(spnMensagens, "Erro ao recuperar as informações"); 
            return;
        }

        // Atualiza os campos do usuário
        usuario.nome = nome;
        usuario.login = user;
        usuario.senha = senha;

        console.log("Enviando para atualização:", usuario);  // Debug

        let res = await server.updateUserPart(usuario, usuario.token.tokenToBase64());
        
        console.log("Resposta do servidor:", res);  // Debug
        
        if (!res || !res.ok) {
            let msgErr = !res.msg ? 'Erro na edição' : res.msg;
            showMsg(spnMensagens, msgErr);
            txtNome.focus();
            return;
        }

        showMsg(spnMensagens, res.msg);

        // Reconstrói o objeto Usuario com o token existente
        let novoUsuario = new Usuario(
            res.data.id_usuario,
            res.data.nome,
            res.data.uuid,
            res.data.login,
            res.data.senha,
            res.data.verificado,
            res.data.ativo,
            usuario.token  // Mantém o token atual
        );

        DataAux.saveUser(novoUsuario);
        
        // Redireciona para a tela anterior
        location.href = '../index.html';
    });

    // addclick(btnInativarUsuario, async () => {
    //     if (!window.confirm("Deseja excluir seus dados ?")) { return; }

    //     //let res = await server.inativarUsuario(usuario.id_usuario, usuario.uuid, usuario.login, usuario.token.tokenToBase64());
    //     let res = await DataAux.inativarUsuario();

    //     DataAux.clearSenhasLocal();
    //     DataAux.deslogar();

    //     // redireciona para a tela anterior
    //     location.href = '../index.html';

    //     // if (!res || !res.ok) {
    //     //     showMsg(spnMensagens, !res.msg ? 'Erro na exclusão' : res.msg);
    //     //     //txtNome.focus();
    //     //     return;
    //     // }
    //     // //console.log(res);
    //     // // redireciona para a tela anterior
    //     // location.href = '../index.html';

    // });


};

async function salvarSenhasLocais() {
    // salva/atualiza as senhas locais (browser) na base de dados
    let res = await DataAux.updateInsertSenhasLocais(server);
    // limpa as senhas locais
    if (!!res && !!res.ok) {
        DataAux.clearSenhasLocal();
    }
}
