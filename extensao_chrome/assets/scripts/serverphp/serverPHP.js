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
            res.data = !!res.data ? Usuario.from(res.data) : undefined;
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
            res.data = !!res.data ? Token.from(res.data) : undefined;
            return res;
        });
    }


    fetchDataUK() {
        return fetch("https://api.coronavirus.data.gov.uk/v1/data", {
            method: "GET"
        }).then(res => res.json());
    }

    listUsers(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
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

    tokenValido(token){
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        return fetch(`${this.#url}userservice/?tipo=tokenvalido`, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json());
    }


    insertUser(nome, login, senha) {
        if (!nome || !login || !senha) { return this.#toerr("Informe o nome, login e senha"); }
        return fetch(`${this.#url}userservice/?tipo=insert`, {
            method: "POST",
            body: JSON.stringify({
                nome: nome,
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res);
            if (!!aux) { 
                aux.data = !!res.data ? Usuario.from(res.data) : undefined;
                return aux; 
            }
            let user = !!res.data ? Usuario.from(res.data) : undefined;
            // token está em uma variável separada no json
            if (!!user && !!res && !!res.token){ user.token = Token.from(res.token); }
            res.data = user;
            return res;
        });
    }

    // update all fields
    updateUser(usuario_obj, token) {
        if (
            !token ||
            !usuario_obj || !usuario_obj.id_usuario || 
            !usuario_obj.nome || !usuario_obj.uuid ||
            !usuario_obj.login || !usuario_obj.senha ||
            usuario_obj.verificado === undefined ||
            usuario_obj.ativo === undefined
        ) { return this.#toerr("Informe os dados do usuário"); }
        return fetch(`${this.#url}userservice/?tipo=update`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: usuario_obj.id_usuario,
                nome: usuario_obj.nome,
                uuid: usuario_obj.uuid,
                login: usuario_obj.login,
                senha: usuario_obj.senha,
                verificado: usuario_obj.verificado,
                ativo: usuario_obj.ativo
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res);
            if (!!aux) { 
                aux.data = !!res.data ? Usuario.from(res.data) : undefined;
                return aux; 
            }
            res.data = Usuario.from(res.data);
            return res;
        });
    }

    // TODO: criar um update menos completo
    // nome, login e senha
    // passando o token, id_usuario e o uuid
    // tanto no server php e na chamada js

    testescors() {
        return fetch(`${this.#url}testes/?tipo=cors`, {
            method: "POST"
        }).then(res => res.json());
    }


}