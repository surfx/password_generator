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

        let nome = txtNome.value;
        let user = txtUsuario.value;
        let senha = txtSenha.value;
        if (!nome) { showMsg(spnMensagens, "Informe o nome"); txtNome.focus(); return; }
        if (!user) { showMsg(spnMensagens, "Informe o usuário"); txtUsuario.focus(); return; }
        if (!senha) { showMsg(spnMensagens, "Informe a senha"); txtSenha.focus(); return; }

        let res = await server.insertUser(nome, user, senha);
        if (!res || !res.ok) {
            let msgErr = !res.msg ? 'Erro no cadastro' : res.msg;
            let i2dots = msgErr.indexOf(':');
            if (i2dots >= 0){
                msgErr = msgErr.substring(0, i2dots+1) + "<br/>" + msgErr.substring(i2dots + 1);
            }
            showMsg(spnMensagens, msgErr);
            txtNome.focus();
            return;
        }
        //console.log(res);

        showMsg(spnMensagens, res.msg);

        DataAux.saveUser(res.data);
        salvarSenhasLocais();

        // redireciona para a tela anterior
        location.href = '../index.html';

    });

};

async function salvarSenhasLocais() {
    // salva/atualiza as senhas locais (browser) na base de dados
    let res = await DataAux.updateInsertSenhasLocais(server);
    // limpa as senhas locais
    if (!!res && !!res.ok) {
        DataAux.clearSenhasLocal();
    }
}