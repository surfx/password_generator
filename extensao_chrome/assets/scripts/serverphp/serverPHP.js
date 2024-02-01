class ServerPHP {

    #url = "http://192.168.0.4/helloworld/code/service/";

    #toerr(msg = undefined) {
        msg = !!msg ? msg : "Erro";
        return new Promise((resolve, reject) => { resolve(new Erro(false, msg)); });
    }
    #toerr_res(res) {
        if (!res || res === undefined) { return { "ok": false, "msg": "Erro - null" }; }
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

    //-- token

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

    // apenas testes
    fetchDataUK() {
        return fetch("https://api.coronavirus.data.gov.uk/v1/data", {
            method: "GET"
        }).then(res => res.json());
    }

    //-- usuário
    
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

    // atualiza apenas o nome, login e senha
    updateUserPart(usuario_obj, token) {
        if (
            !token ||
            !usuario_obj || !usuario_obj.id_usuario || 
            !usuario_obj.nome || !usuario_obj.uuid ||
            !usuario_obj.login || !usuario_obj.senha
        ) { return this.#toerr("Informe os dados do usuário"); }
        return fetch(`${this.#url}userservice/?tipo=update_part`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: usuario_obj.id_usuario,
                nome: usuario_obj.nome,
                uuid: usuario_obj.uuid,
                login: usuario_obj.login,
                senha: usuario_obj.senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res);
            if (!!aux || !aux.ok) { 
                aux.data = !!res.data ? Usuario.from(res.data) : undefined;
                return aux; 
            }
            res.data = Usuario.from(res.data);
            return res;
        });
    }

    //-- senha
    listarSenhas(id_usuario, dominio, token){
        if (!token || !id_usuario || id_usuario <= 0 || !dominio) { 
            return this.#toerr("Informe os dados para consulta"); 
        }
        return fetch(`${this.#url}senhas/?tipo=listar`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: id_usuario,
                dominio: dominio
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }

            let data = [];
            res.data.forEach(element => {
                data.push(Senha.from(element));
            });
            res.data = data;
            return res;
        });
    }


    //salvar
    salvarSenha(id_usuario, dominio, login, senha, token){
        if (!token || !id_usuario || id_usuario <= 0 || !login || !senha || !dominio) { 
            return this.#toerr("Informe os dados da senha"); 
        }
        return fetch(`${this.#url}senhas/?tipo=salvar`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: id_usuario,
                dominio: dominio,
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            res.data = !!res.data ? Senha.from(res.data) : undefined;
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }
            return res;
        });
    }

    //atualizar
    atualizarSenha(id_senha, id_usuario, dominio, login, senha, token){
        if (!token || !id_senha || id_senha <= 0 || !token || !id_usuario || id_usuario <= 0 || !login || !senha || !dominio) { 
            return this.#toerr("Informe os dados da senha"); 
        }
        return fetch(`${this.#url}senhas/?tipo=editar`, {
            method: "POST",
            body: JSON.stringify({
                id_senha: id_senha,
                id_usuario: id_usuario,
                dominio: dominio,
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            res.data = !!res.data ? Senha.from(res.data) : undefined;
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }
            return res;
        });
    }

    //deletar
    deletarSenha(id_senha, id_usuario, dominio, token){
        if (!token || !id_senha || id_senha <= 0 || !token || !id_usuario || !dominio) { 
            return this.#toerr("Informe os dados para excluir a senha"); 
        }
        return fetch(`${this.#url}senhas/?tipo=excluir`, {
            method: "POST",
            body: JSON.stringify({
                id_senha: id_senha,
                id_usuario: id_usuario,
                dominio: dominio
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        }).then(res => res.json())
        .then(res => {
            res.data = !!res.data ? Senha.from(res.data) : undefined;
            let aux = this.#toerr_res(res); if (!!aux) { return aux; }
            return res;
        });
    }

    testescors() {
        return fetch(`${this.#url}testes/?tipo=cors`, {
            method: "POST"
        }).then(res => res.json());
    }


}