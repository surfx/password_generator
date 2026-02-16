class ServerNative {

    #NATIVE_HOST = "com.emerson.password_generator";

    #toerr(msg = undefined) {
        msg = !!msg ? msg : "Erro";
        // Assume Erro class exists globally as in original file
        return new Promise((resolve, reject) => { resolve(new Erro(false, msg)); });
    }

    #toerr_res(res) {
        if (!res || res === undefined || res === 'undefined') { return { "ok": false, "msg": "Erro - null" }; }
        if (!res.ok) { return Erro.from(res); }
        if (!res.data) { return { "ok": true, "data": undefined, "msg": res.msg }; }
        return undefined;
    }

    // Helper para comunicação nativa
    async #send(action, payload) {
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendNativeMessage(this.#NATIVE_HOST, {
                    action: action,
                    payload: payload
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("Native Messaging Error:", chrome.runtime.lastError.message);
                        resolve({ ok: false, msg: "Erro Native: " + chrome.runtime.lastError.message });
                    } else {
                        resolve(response);
                    }
                });
            } catch (e) {
                console.error("Exception sending message:", e);
                resolve({ ok: false, msg: "Exceção: " + e.message });
            }
        });
    }

    async doLogin(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        let res = await this.#send("login", { login, senha });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        if (!!res.data && !!res.token) { res.data.token = Token.from(res.token); }
        return res;
    }

    async getToken(login, senha) {
        if (!login || !senha) { return this.#toerr("Informe o login e a senha"); }
        let res = await this.#send("get_token", { login, senha });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        
        res.data = !!res.data ? Token.from(res.data) : undefined;
        return res;
    }

    async excluirTokensInvalidos() {
        let res = await this.#send("tokensinvalidos", {});
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    async tokenValido(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        let res = await this.#send("tokenvalido", { authorization: token });
        return !!res ? res : this.#toerr_res(res);
    }

    async doLogout(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        let res = await this.#send("logout", { authorization: token });
        return !!res ? res : this.#toerr_res(res);
    }

    async listUsers(token) {
        if (!token) { return this.#toerr("Informe o token em base 64"); }
        let res = await this.#send("list_users", { authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        
        let data = [];
        if (res.data && Array.isArray(res.data)) {
            res.data.forEach(element => { data.push(Usuario.from(element)); });
        }
        res.data = data;
        return res;
    }

    async insertUser(nome, login, senha) {
        if (!nome || !login || !senha) { return this.#toerr("Informe o nome, login e senha"); }
        let res = await this.#send("insert_user", { nome, login, senha });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        if (!!res.data && !!res.token) { res.data.token = Token.from(res.token); }
        return res;
    }

    async updateUser(usuario_obj, token) {
        if (!token || !usuario_obj || !usuario_obj.id_usuario) { return this.#toerr("Informe os dados do usuário"); }
        let payload = { ...usuario_obj, authorization: token };
        let res = await this.#send("update_user", payload);
        
        if (!res) { return this.#toerr_res(res); }
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    async updateUserPart(usuario_obj, token) {
        if (!token || !usuario_obj || !usuario_obj.id_usuario) { return this.#toerr("Informe os dados do usuário"); }
        let payload = { ...usuario_obj, authorization: token };
        let res = await this.#send("update_user_part", payload);
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        return res;
    }

    async inativarUsuario(id_usuario, uuid, login, token) {
        if (!token || !id_usuario) { return this.#toerr("Informe os dados"); }
        let res = await this.#send("inativar_user", { id_usuario, uuid, login, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Usuario.from(res.data) : undefined;
        return res;
    }

    async listarSenhas(id_usuario, dominio, token) {
        if (!token || !id_usuario) { return this.#toerr("Informe os dados"); }
        let res = await this.#send("listar_senhas", { id_usuario, dominio, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        
        let data = [];
        if (res.data && Array.isArray(res.data)) {
            res.data.forEach(element => { data.push(Senha.from(element)); });
        }
        res.data = data;
        return res;
    }

    async salvarSenha(id_usuario, dominio, login, senha, token) {
        if (!token || !id_usuario) { return this.#toerr("Informe os dados"); }
        let res = await this.#send("salvar_senha", { id_usuario, dominio, login, senha, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    async atualizarSenha(id_senha, id_usuario, dominio, login, senha, token) {
        if (!token || !id_senha) { return this.#toerr("Informe os dados"); }
        let res = await this.#send("editar_senha", { id_senha, id_usuario, dominio, login, senha, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        return res;
    }

    async deletarSenha(id_senha, id_usuario, dominio, token) {
        if (!token || !id_senha) { return this.#toerr("Informe os dados"); }
        let res = await this.#send("excluir_senha", { id_senha, id_usuario, dominio, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    async updateInsertSenhas(senhas, id_usuario, token) {
        if (!token || !senhas) { return this.#toerr("Informe os dados"); }
        
        // Converte objetos de senha se necessário (assume que toJsonSerialize retorna string JSON)
        let senhas_plain = [];
        for (let s of senhas) {
            if (s && typeof s.toJsonSerialize === 'function') {
                try {
                    let obj = JSON.parse(s.toJsonSerialize()); 
                    senhas_plain.push(obj);
                } catch(e) { senhas_plain.push(s); }
            } else {
                senhas_plain.push(s);
            }
        }

        let res = await this.#send("update_insert_senhas", { senhas: senhas_plain, id_usuario, authorization: token });
        
        if (!res) { return this.#toerr_res(res); }
        let aux = this.#toerr_res(res); if (!!aux) { return aux; }
        return res;
    }

    async fetchDataUK() {
        const res = await fetch("https://api.coronavirus.data.gov.uk/v1/data", { method: "GET" });
        return await res.json();
    }

    async testescors() {
        return { ok: true, msg: "Native Messaging não usa CORS" };
    }
}
