
let link1 = document.getElementById('link1');
let link2 = document.getElementById('link2');
let link3 = document.getElementById('link3'); // listUsers
let link4 = document.getElementById('link4');
let link5 = document.getElementById('link5');
let link6 = document.getElementById('link6');
let link7 = document.getElementById('link7');
let link8 = document.getElementById('link8');

const server = new ServerPHP();


function addclick(obj, fn){ if (!obj || !fn){return;} obj.addEventListener("click", function () { fn(); }); }

addclick(link1, ()=>{ 
    let login = "new9@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master
    server.doLogin(login, senha).then(res => {
        //console.log(res);
        if (!res||!res.ok){console.log(res.toString());return;}
        console.log(res.data.toString());

        // token
        if (!!res.data.token && !!res.data.token.token){
            console.log(res.data.token.token.toString(), " - ", res.data.token.tokenToBase64());
        }

    });
});
//addclick(link2, ()=>{ server.fetchDataUK().then(console.log); });
addclick(link3, ()=>{ 

    // usuário comum - sem permissão
    let login = "eme@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master - com permissão

    server.getToken(login, senha).then(res => {
        if (!res||!res.ok||!res.data){console.log(res.toString());return;}
        let token = res.data.tokenToBase64();
        if (!token){return;}
        server.listUsers(token).then(res => {
            //console.log(res);
            if (!res || !res.ok){console.log(res?.toString());return;}
            res.data.forEach(user => { console.log(user.toString()); })
        });
    });


});
addclick(link4, ()=>{ server.testescors().then(console.log); });
addclick(link5, ()=>{ 
    server.getToken("eme@gmail.com", "123").then(res => {
        console.log(res);
        if (!res||!res.ok){console.log(res.toString());return;}
        console.log(res.data.toString());
        console.log(res.data.tokenToBase64());
    });
});
addclick(link6, ()=>{ 
    let token = "MjEzOTk1ZTUwY2ZhMTgxNWJmOGRmOGExYTM2ZjkzZTU=";
    server.tokenValido(token).then(res => {
        console.log(res);
    });
});
addclick(link7, ()=>{ 
    let nome = "novo usuário";
    let login = "new9@gmail.com";
    let senha = "123";
    server.insertUser(nome, login, senha).then(res => {
        if (!res.ok){ console.log(res.msg, "{", res.data.toString(), "}"); return; }
        //console.log(res);
        console.log(res.msg, "{", res.data.toString(), "}");
    });
});
addclick(link8, ()=>{ 
    let token = 'YWU2NTVkMzNkN2E0NDAyNDYyMWEwMGM5YWVjZmNlOWE=';
    let user = new Usuario(15, 'novo nome 2', 'dsfasdfasdfsadf', 'afsdsdm@gmail.com', "senha", true, true, undefined);
    server.updateUser(user, token).then(res => {
        if (!res.ok){ console.log(res.msg, "{", res.data.toString(), "}"); return; }
        console.log(res.msg, "{", res.data.toString(), "}");
    });
});
