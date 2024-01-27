class ServerPHP {

    #url = "http://192.168.0.4/helloworld/code/service/";

    #toerr(msg = undefined) {
        msg = !!msg ? msg : "Erro";
        return new Promise((resolve, reject) => { resolve(new Erro(false, msg)); });
    }
    #toerr_res(res) {
        if (!res) { return { "ok": false, "msg": "Erro - null" }; }
        if (!res.ok) { return Erro.from(res); }
        if (!res.data) { return { "ok": true, "data": undefined }; }
        return undefined;
    }

    doLogin(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        return fetch(`${this.#url}userservice/?tipo=login`, {
            method: "POST",
            body: JSON.stringify({
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }
            res.data = Usuario.from(res.data);
            return res;
        });
    }

    getToken(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        return fetch(`${this.#url}authenticacao/`, {
            method: "POST",
            body: JSON.stringify({
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }
            res.data = Token.from(res.data);
            return res;
        });
    }


    // curl -i -X POST \
    // -H "Content-Type:application/json" \
    // -d \
    // '{
    // "login": "new@gmail.com",
    // "senha": "123"
    // }' \
    // '${this.#url}authenticacao/'


    fetchDataUK() {
        return fetch("https://api.coronavirus.data.gov.uk/v1/data", {
            method: "GET"
        }).then(res => res.json());
    }

    listUsers(token) {
        //let autorizacaook = 'OTUxZjJkMzAzY2QyYTY1N2QzZDE5ZjAxNjc0NzU3NjU=';
        //autorizacaook = "MWFhM2UzOGViMTU4NTM4OTkxOWU5MmEyYTU4NGQ0ZWU="; // err
        return fetch(`${this.#url}userservice/?tipo=listuser`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }

            let data = [];
            res.data.forEach(element => {
                data.push(Usuario.from(element));
            });

            res.data = data;
            return res;
        });

    }

    testescors() {
        return fetch(`${this.#url}testes/?tipo=cors`, {
            method: "POST"
        }).then(res => res.json());
    }


}