let link1 = document.getElementById('link1'); // doLogin
let link2 = document.getElementById('link2');
let link3 = document.getElementById('link3'); // listUsers
let link4 = document.getElementById('link4');
let link5 = document.getElementById('link5');
let link6 = document.getElementById('link6');
let link7 = document.getElementById('link7');
let link8 = document.getElementById('link8');
let link9 = document.getElementById('link9');
let link10 = document.getElementById('link10');
let link11 = document.getElementById('link11');
let link12 = document.getElementById('link12');
let link13 = document.getElementById('link13');
let link14 = document.getElementById('link14'); // roteiro 1
let link15 = document.getElementById('link15'); // alterar senha admin

const server = new ServerPHP();
const dtlocal = new DataLocal();

function addclick(obj, fn) { if (!obj || !fn) { return; } obj.addEventListener("click", function () { fn(); }); }

addclick(link1, async () => { // doLogin
    let login = "eme@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master
    login = "master123@master.com"; senha = "b6K+x!nasGfaCDk";

    let res = await server.doLogin(login, senha);
    //console.log(res);
    if (!res || !res.ok) { console.log(res.toString()); return; }
    console.log(res.data.toString());
    // token
    if (!!res.data.token && !!res.data.token.token) {
        console.log(res.data.token.token.toString(), " - ", res.data.token.tokenToBase64());
    }
});
//addclick(link2, ()=>{ server.fetchDataUK().then(console.log); });
addclick(link3, async () => {
    // usuário comum - sem permissão
    let login = "eme@gmail.com";
    let senha = "senha";
    //login = "ma...m"; senha = "b...k"; //master - com permissão
    login = "master123@master.com"; senha = "b6K+x!nasGfaCDk"; //master - com permissão

    let res = await server.getToken(login, senha);
    if (!res || !res.ok || !res.data) { console.log(res.toString()); return; }
    let token = res.data.tokenToBase64();
    if (!token) { return; }
    res = await server.listUsers(token);
    //console.log(res);
    if (!res || !res.ok) { console.log(res?.toString()); return; }
    res.data.forEach(user => { console.log(user.toString()); })
});
addclick(link4, async () => {
    let res = await server.testescors();
    console.log(res);
});
addclick(link5, async () => {
    let res = await server.getToken("eme@gmail.com", "senha");
    console.log(res);
    if (!res || !res.ok) { console.log(res.toString()); return; }
    console.log(res.data);
    console.log(res.data.tokenToBase64());
});
addclick(link6, async () => {
    let token = "OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=";
    let res = await server.tokenValido(token);
    console.log(res);
});
addclick(link7, async () => {
    let nome = "novo usuário";
    let login = "new92@gmail.com";
    let senha = "123";
    let res = await server.insertUser(nome, login, senha);
    if (!res.ok) { console.log(res.msg, "{", res.data.toString(), "}"); return; }
    //console.log(res);
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});
addclick(link8, async () => { //updateUser
    let token = 'NTQyZmQ5ZmRlM2VmODc5NzUwNmQyYmVjNjU4YWFmMDU=';
    let user = new Usuario(2, 'novo nome 2', '81d9f5a7-bbef-11ee-9108-d85ed38ea852', 'eme@gmail.com', "senha", true, true, undefined);
    let res = await server.updateUser(user, token);
    if (!res.ok) {
        console.log(res.msg, "{",
            !!res.data ? res.data.toString() : "indefinido"
            , "}"); return;
    }
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});
addclick(link9, async () => { //updateUserPart
    let token = 'NTQyZmQ5ZmRlM2VmODc5NzUwNmQyYmVjNjU4YWFmMDU=';
    let user = new Usuario(2, 'novo nome 311', '81d9f5a7-bbef-11ee-9108-d85ed38ea852', 'new78@gmail.com', "senha", true, undefined, undefined);
    let res = await server.updateUserPart(user, token);
    //console.log(res);
    if (!res.ok) {
        console.log(res.msg, "{",
            !!res.data ? res.data.toString() : "indefinido"
            , "}"); return;
    }
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});

addclick(link10, async () => { // listarSenhas
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_usuario = 16;
    let dominio = 'youtube';
    let res = await server.listarSenhas(id_usuario, dominio, token);
    if (!res.ok) { console.log(res.msg, "{", res.data, "}"); return; }
    res.data.forEach(senha => { console.log(senha.toString()); })
});

addclick(link11, async () => { //salvarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_usuario = 16;
    let dominio = 'youtube';
    let login = 'login_yt2@gmail.com';
    let senha = 'senha yt2 123';
    let res = await server.salvarSenha(id_usuario, dominio, login, senha, token);
    if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});

addclick(link12, async () => { //atualizarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_senha = 6;
    let id_usuario = 16;
    let dominio = 'youtube';
    let login = 'user2@gmail.com';
    let senha = '123as';
    let res = await server.atualizarSenha(id_senha, id_usuario, dominio, login, senha, token);
    if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});

addclick(link13, async () => { //deletarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_senha = 8;
    let id_usuario = 16;
    let dominio = 'youtube';
    let res = await server.deletarSenha(id_senha, id_usuario, dominio, token);
    if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
    console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
});

// TODO: criar classes para controle de objetos no browser
async function loadUser(login, senha, key_user = "usuario_logado") {
    let usuario = dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);

    if (!!usuario && !!usuario.id_usuario && usuario.id_usuario > 0) {
        return usuario;
    }

    let res = await server.doLogin(login, senha);
    if (!res || !res.ok) {
        dtlocal.clear(key_user);
        console.log(res.toString());
        return undefined;
    }

    dtlocal.save_obj(key_user, res.data, u => u.toJsonSerialize()); //salva o usuário
    // token
    //if (!!res.data.token && !!res.data.token.token) { console.log(res.data.token.token.toString(), " - ", res.data.token.tokenToBase64()); }
    return res.data;
}

addclick(link14, async () => { //roteiro 1
    let login = "new9@gmail.com";
    let senha = "123";
    let usuario = await loadUser(login, senha);
    console.log(usuario);
    if (!usuario) { return; }

    let res = await server.tokenValido(usuario.token.tokenToBase64());
    if (!res || !res.valido || !usuario.token) {
        res = await server.getToken(login, senha);
        usuario.token = !!res && !!res.ok ? res.data : undefined;
    }
    if (!usuario.token) { return; } // erro ao recuperar o token

    res = await server.tokenValido(usuario.token.tokenToBase64());
    if (!res || !res.valido) { return; } // token inválido

    let dominio = 'youtube';
    res = await server.listarSenhas(usuario.id_usuario, dominio, usuario.token.tokenToBase64());
    if (!res.ok) { console.log(res.msg, "{", res.data, "}"); return; }
    res.data.forEach(senha => { console.log(senha.toString()); })


});

addclick(link15, async () => { //alterar senha master
    let login = "m...com";
    let senha = "g...R";

    let res = await server.doLogin(login, senha);
    if (!res || !res.ok || !res.data) { return; }
    let usuario = res.data;
    console.log(usuario);
    if (!usuario) { return; }

    res = await server.tokenValido(usuario.token.tokenToBase64());
    if (!res || !res.valido || !usuario.token) {
        res = await server.getToken(login, senha);
        usuario.token = !!res && !!res.ok ? res.data : undefined;
    }
    if (!usuario.token) { return; } // erro ao recuperar o token

    res = await server.tokenValido(usuario.token.tokenToBase64());
    if (!res || !res.valido) { return; } // token inválido

    usuario.senha = "minha_nova_senha";

    // atualiza apenas o nome, login e senha
    res = await server.updateUserPart(usuario, usuario.token.tokenToBase64());
    if (!res.ok) { console.log(res.msg, "{", res.data, "}"); return; }
    console.log(res);

});