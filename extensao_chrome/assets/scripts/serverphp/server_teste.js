
let link1 = document.getElementById('link1');
let link2 = document.getElementById('link2');
let link3 = document.getElementById('link3');
let link4 = document.getElementById('link4');
let link5 = document.getElementById('link5');
let link6 = document.getElementById('link6');

const server = new ServerPHP();


function addclick(obj, fn){ if (!obj || !fn){return;} obj.addEventListener("click", function () { fn(); }); }

addclick(link1, ()=>{ 
    server.doLogin("eme@gmail.com", "123").then(res => {
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

    let login = "eme@gmail.com";
    let senha = "123";
    //login = "ma...m"; senha = "b...k"; //master

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

});