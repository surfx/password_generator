import '/assets/scripts/serverphp/serverPHP.js';

let link1 = document.getElementById('link1');
let link2 = document.getElementById('link2');
let link3 = document.getElementById('link3');
let link4 = document.getElementById('link4');

const server = new ServerPHP();

if (!!link1){
    link1.addEventListener("click", function () {
        server.doLogin("eme@gmail.com", "123");
    });
}

if (!!link2){
    link2.addEventListener("click", function () {
        server.fetchDataUK();
    });
}

if (!!link3){
    link3.addEventListener("click", function () {
        server.listUsers();
    });
}

if (!!link4){
    link4.addEventListener("click", function () {
        server.testescors();
    });
}