let link1 = document.getElementById('link1');
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

const server = new ServerPHP();
const dtlocal = new DataLocal();

function addclick(obj, fn) { if (!obj || !fn) { return; } obj.addEventListener("click", function () { fn(); }); }

addclick(link1, () => {
    let login = "new9@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master
    server.doLogin(login, senha).then(res => {
        //console.log(res);
        if (!res || !res.ok) { console.log(res.toString()); return; }
        console.log(res.data.toString());

        // token
        if (!!res.data.token && !!res.data.token.token) {
            console.log(res.data.token.token.toString(), " - ", res.data.token.tokenToBase64());
        }

    });
});
//addclick(link2, ()=>{ server.fetchDataUK().then(console.log); });
addclick(link3, () => {

    // usuário comum - sem permissão
    let login = "eme@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master - com permissão

    server.getToken(login, senha).then(res => {
        if (!res || !res.ok || !res.data) { console.log(res.toString()); return; }
        let token = res.data.tokenToBase64();
        if (!token) { return; }
        server.listUsers(token).then(res => {
            //console.log(res);
            if (!res || !res.ok) { console.log(res?.toString()); return; }
            res.data.forEach(user => { console.log(user.toString()); })
        });
    });


});
addclick(link4, () => { server.testescors().then(console.log); });
addclick(link5, () => {
    server.getToken("eme@gmail.com", "123").then(res => {
        console.log(res);
        if (!res || !res.ok) { console.log(res.toString()); return; }
        console.log(res.data.toString());
        console.log(res.data.tokenToBase64());
    });
});
addclick(link6, () => {
    let token = "MjEzOTk1ZTUwY2ZhMTgxNWJmOGRmOGExYTM2ZjkzZTU=";
    server.tokenValido(token).then(res => {
        console.log(res);
    });
});
addclick(link7, () => {
    let nome = "novo usuário";
    let login = "new9@gmail.com";
    let senha = "123";
    server.insertUser(nome, login, senha).then(res => {
        if (!res.ok) { console.log(res.msg, "{", res.data.toString(), "}"); return; }
        //console.log(res);
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});
addclick(link8, () => {
    let token = 'MDBkMTQ3ZWRmZGJmMTdjZjYxNDdmMTY4OTQ5ZDJjZjM=';
    let user = new Usuario(7, 'novo nome 2', '81d9f5a7-bbef-11ee-9108-d85ed38ea852', 'new@gmail.com', "senha", true, true, undefined);
    server.updateUser(user, token).then(res => {
        if (!res.ok) {
            console.log(res.msg, "{",
                !!res.data ? res.data.toString() : "indefinido"
                , "}"); return;
        }
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});
addclick(link9, () => {
    let token = 'MDBkMTQ3ZWRmZGJmMTdjZjYxNDdmMTY4OTQ5ZDJjZjM=';
    let user = new Usuario(8, 'novo nome 311', '81d9f5a7-bbef-11ee-9108-d85ed38ea852', 'new78@gmail.com', "senha", true, undefined, undefined);
    server.updateUserPart(user, token).then(res => {
        if (!res.ok) {
            console.log(res.msg, "{",
                !!res.data ? res.data.toString() : "indefinido"
                , "}"); return;
        }
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});

addclick(link10, () => {
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_usuario = 16;
    let dominio = 'youtube';
    server.listarSenhas(id_usuario, dominio, token).then(res => {
        if (!res.ok) { console.log(res.msg, "{", res.data, "}"); return; }
        res.data.forEach(senha => { console.log(senha.toString()); })
    });
});

addclick(link11, () => { //salvarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_usuario = 16;
    let dominio = 'youtube';
    let login = 'login_yt2@gmail.com';
    let senha = 'senha yt2 123';
    server.salvarSenha(id_usuario, dominio, login, senha, token).then(res => {
        if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});

addclick(link12, () => { //atualizarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_senha = 6;
    let id_usuario = 16;
    let dominio = 'youtube';
    let login = 'user2@gmail.com';
    let senha = '123as';
    server.atualizarSenha(id_senha, id_usuario, dominio, login, senha, token).then(res => {
        if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});

addclick(link13, () => { //deletarSenha
    let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    let id_senha = 12;
    let id_usuario = 16;
    let dominio = 'youtube';
    server.deletarSenha(id_senha, id_usuario, dominio, token).then(res => {
        if (!res.ok) { console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}"); return; }
        console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    });
});

addclick(link14, () => { //roteiro 1

    // let ok = dtlocal.save("obj1", {"emerson": "hoje eu fui na padaria", "ok": true});
    // if (!ok){ console.log("ERRO"); return; }

    // let obj = dtlocal.load("obj1");
    // if (!obj){ console.log("ERRO"); return; }
    // console.log(obj);

    // dtlocal.clear("obj1");
    // obj = dtlocal.load("obj1");
    // if (!obj){ console.log("objeto excluído, all ok"); return; }
    // console.log(obj);

    //-------------------------------

    const key_user = "usuario_logado";
    dtlocal.clear(key_user);

    let usuario = dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);

    if (!!usuario) {
        console.log("LOAD OK");
        console.log(usuario);
        return;
    }

    let login = "new9@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master
    server.doLogin(login, senha).then(res => {
        console.log(res);
        if (!res || !res.ok) {
            dtlocal.clear(key_user);
            console.log(res.toString());
            return; 
        }

        let teste = JSON.stringify(res.data);
        // console.log("---------------------------");
        // console.log(res.data);
        // console.log(teste);
        // console.log("---------------------------");

        dtlocal.save_obj(key_user, res.data, (u) => { return !!u ? u.toJsonSerialize(): undefined; }); //salva o usuário
        //console.log(res.data.toString());

        // toJsonSerialize
        console.log("---------------------------");
        let s = res.data.toJsonSerialize();
        let ds = Usuario.fromJsonSerialize(s);
        console.log("s: ",  s);
        console.log("JSON.stringify: ",  JSON.stringify(s));
        console.log("ds: ",  ds);
        console.log("---------------------------");

        // token
        if (!!res.data.token && !!res.data.token.token) {
            //console.log(res.data.token.token.toString(), " - ", res.data.token.tokenToBase64());

            let serializado = res.data.token.toJsonSerialize();
            let deserializado = Token.fromJsonSerialize(serializado);
            console.log("serializado: ",  serializado);
            console.log("JSON.stringify: ",  JSON.stringify(serializado));
            console.log("deserializado: ",  deserializado);

        }

    });
    //-------------------------------

    // let token = 'OGYyZWJjZDMxNWNiM2NjNjI0NmRkYTNhYmQ0NWIwNGI=';
    // let id_senha = 12;
    // let id_usuario = 16;
    // let dominio = 'youtube';
    // server.deletarSenha(id_senha, id_usuario, dominio, token).then(res => {
    //     if (!res.ok){ console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido" , "}"); return; }
    //     console.log(res.msg, "{", !!res.data ? res.data.toString() : "indefinido", "}");
    // });
});