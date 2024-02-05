class ServerPHP {

    #url = "http://192.168.0.4/helloworld/code/service/";

    #toerr(msg = undefined) {
        msg = !!msg ? msg : "Erro";
        return new Promise((resolve, reject) => { resolve(new Erro(false, msg)); });
    }
    #toerr_res(res) {
        if (!res || res === undefined || res === 'undefined') { return { "ok": false, "msg": "Erro - null" }; }
        if (!res.ok) { return Erro.from(res); }
        if (!res.data) { return { "ok": true, "data": undefined, "msg": res.msg }; }
        return undefined;
    }

    async doLogin(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        const res = await fetch(`${this.#url}userservice/?tipo=login`, {
            method: "POST",
            body: JSON.stringify({
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        const res_1 = await res.json();
        let aux = this.#toerr_res(res_1);
        if (!!aux) { return aux; }
        res_1.data = !!res_1.data ? Usuario.from(res_1.data) : undefined;
        return res_1;
    }

    //-- token

    async getToken(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        let res = await fetch(`${this.#url}authenticacao/`, {
            method: "POST",
            body: JSON.stringify({
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Token.from(res.data) : undefined;
        return res;
    }

    async tokenValido(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        let res = await fetch(`${this.#url}userservice/?tipo=tokenvalido`, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        });
        res = !res ? undefined : await res.json();
        return !!res ? res : this.#toerr_res(res);
    }

    //-- usuário

    async listUsers(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        let res = await fetch(`${this.#url}userservice/?tipo=listuser`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        let data = [];
        res.data.forEach(element => { data.push(Usuario.from(element)); });
        res.data = data;
        return res;
    }

    async insertUser(nome, login, senha) {
        if (!nome || !login || !senha) { return this.#toerr("Informe o nome, login e senha"); }
        let res = await fetch(`${this.#url}userservice/?tipo=insert`, {
            method: "POST",
            body: JSON.stringify({
                nome: nome,
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });
        res = !res ? undefined : await res.json();
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        // token está em uma variável separada no json
        if (!!res.data && !!res.token) { res.data.token = Token.from(res.token); }
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    // update all fields
    async updateUser(usuario_obj, token) {
        if (
            !token ||
            !usuario_obj || !usuario_obj.id_usuario ||
            !usuario_obj.nome || !usuario_obj.uuid ||
            !usuario_obj.login || !usuario_obj.senha ||
            usuario_obj.verificado === undefined ||
            usuario_obj.ativo === undefined
        ) { return this.#toerr("Informe os dados do usuário"); }
        let res = await fetch(`${this.#url}userservice/?tipo=update`, {
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
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    // atualiza apenas o nome, login e senha
    async updateUserPart(usuario_obj, token) {
        if (
            !token ||
            !usuario_obj || !usuario_obj.id_usuario ||
            !usuario_obj.nome || !usuario_obj.uuid ||
            !usuario_obj.login || !usuario_obj.senha
        ) { return this.#toerr("Informe os dados do usuário"); }
        let res = await fetch(`${this.#url}userservice/?tipo=update_part`, {
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
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        return res;
    }

    //-- senha
    async listarSenhas(id_usuario, dominio, token) {
        if (!token || !id_usuario || id_usuario <= 0 || !dominio) {
            return this.#toerr("Informe os dados para consulta");
        }
        let res = await fetch(`${this.#url}senhas/?tipo=listar`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: id_usuario,
                dominio: dominio
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token
            }
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        let data = [];
        res.data.forEach(element => { data.push(Senha.from(element)); });
        res.data = data;
        return res;
    }


    //salvar
    async salvarSenha(id_usuario, dominio, login, senha, token) {
        if (!token || !id_usuario || id_usuario <= 0 || !login || !senha || !dominio) {
            return this.#toerr("Informe os dados da senha");
        }
        let res = await fetch(`${this.#url}senhas/?tipo=salvar`, {
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
        });
        res = !res ? undefined : await res.json();
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    //atualizar
    async atualizarSenha(id_senha, id_usuario, dominio, login, senha, token) {
        if (!token || !id_senha || id_senha <= 0 || !token || !id_usuario || id_usuario <= 0 || !login || !senha || !dominio) {
            return this.#toerr("Informe os dados da senha");
        }
        let res = await fetch(`${this.#url}senhas/?tipo=editar`, {
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
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        return res;
    }

    //deletar
    async deletarSenha(id_senha, id_usuario, dominio, token) {
        if (!token || !id_senha || id_senha <= 0 || !id_usuario || !dominio) {
            return this.#toerr("Informe os dados para excluir a senha");
        }
        let res = await fetch(`${this.#url}senhas/?tipo=excluir`, {
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
        });
        res = !res ? undefined : await res.json();
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }


    async updateInsertSenhas(senhas, id_usuario, token) {
        if (!token || !senhas || senhas.length <= 0 || !id_usuario || id_usuario <= 0) { return this.#toerr("Informe os dados para inserir as senhas"); }

        let body = '[';
        for (let i = 0; i < senhas.length; i++) {
            if (!senhas[i]) { continue; }
            if (!senhas[i].id_usuario || senhas[i].id_usuario.length <= 0) { senhas[i].id_usuario = id_usuario; }
            body += senhas[i].toJsonSerialize() + ',';
        }
        body = body.substring(0, body.length - 1);
        body += ']';

        //console.log(body);

        let res = await fetch(`${this.#url}senhas/?tipo=update_insert`, {
            method: "POST",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "authorization": token,
                "id_usuario": id_usuario
            },
            body: body
        });
        res = !res ? undefined : await res.json();
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }


    //-- teste
    async fetchDataUK() {
        const res = await fetch("https://api.coronavirus.data.gov.uk/v1/data", {
            method: "GET"
        });
        return await res.json();
    }

    async testescors() {
        let res = await fetch(`${this.#url}testes/?tipo=cors`, {
            method: "POST"
        });
        res = !res ? undefined : await res.json();
        return !!res ? res : this.#toerr_res(res);
    }


}