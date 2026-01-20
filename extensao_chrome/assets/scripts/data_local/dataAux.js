class DataAux {

    //static #server = new ServerPHP();
    static #server = (typeof ServerPython !== 'undefined') ? new ServerPython() : new ServerPHP();
    static #dtlocal = new DataLocal();

    //------------------------------
    // usuários
    //------------------------------

    static async loadUser(login, senha, key_user = "usuario_logado") {
        let usuario = this.#dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);

        if (!!usuario && !!usuario.id_usuario && usuario.id_usuario > 0) {
            // verifica se o login informados correspondem com o que está na memória
            if (usuario.login === login) {
                return usuario;
            }
            this.#dtlocal.clear(key_user);
        }

        let res = await this.#server.doLogin(login, senha);
        if (!res || !res.ok) {
            this.#dtlocal.clear(key_user);
            //console.log(res.toString());
            return undefined;
        }

        this.#dtlocal.save_obj(key_user, res.data, u => u.toJsonSerialize()); //salva o usuário
        return res.data;
    }

    static saveUser(usuario, key_user = "usuario_logado") {
        this.deslogar(key_user);
        if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0) { return; }
        this.#dtlocal.save_obj(key_user, usuario, u => u.toJsonSerialize()); //salva o usuário
    }

    static getUsuarioLogado(key_user = "usuario_logado") {
        let usuario = this.#dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);
        if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0 ||
            !usuario.token || !usuario.token.id || usuario.token.id <= 0 ||
            !usuario.token.token || !usuario.token.validade ||
            usuario.token.validade.length < 19 ||
            usuario.dataValidadeToken() <= new Date()) { // verifica a data de validade
            this.deslogar(key_user);
            return undefined;
        }
        return usuario;
    }

    static deslogar(key_user = "usuario_logado") {
        this.#dtlocal.clear(key_user);
    }

    static inativarUsuario(key_user = "usuario_logado"){
        let usuario = this.getUsuarioLogado();
        //console.log(usuario);
        if (!usuario){
            this.deslogar(key_user);
            return { ok: false, msg: "Erro ao deslogar" };
        }

        return this.#server.inativarUsuario(
            usuario.id_usuario, 
            usuario.uuid, 
            usuario.login, 
            usuario.token.tokenToBase64()
        );
    }

    //------------------------------
    // senhas
    //------------------------------
    static async saveSenha(login, senha, dominio) {
        if (!this.#server) { return undefined; }
        let usuario = this.getUsuarioLogado();
        if (!usuario || !dominio || !usuario.id_usuario || !login || !senha || !usuario.token || !usuario.token.tokenToBase64()) {
            // salvar a senha localmente
            // cria o Promisse para manter a assinatura do método
            return new Promise((resolve, reject) => {
                let rt = this.#saveSenhasLocal(new Senha(undefined, undefined, dominio, login, senha));
                resolve({ ok: rt, msg: undefined });
            });
        }
        return await this.#server.salvarSenha(usuario.id_usuario, dominio, login, senha, usuario.token.tokenToBase64());
    }

    static async loadSenhas(dominio) {
        if (!this.#server) { return undefined; }
        let usuario = this.getUsuarioLogado();

        if (!usuario || !dominio || !usuario.id_usuario || !usuario.token || !usuario.token.tokenToBase64()) {
            // recupera as senhas localmente
            // cria o Promisse para manter a assinatura do método
            return new Promise((resolve, reject) => {
                let rt = this.#recuperarSenhasDominioLocal(dominio, undefined);
                resolve({ ok: true, msg: undefined, data: rt });
            });
        }

        if (!usuario || !dominio || !usuario.id_usuario || !usuario.token || !usuario.token.tokenToBase64()) { return undefined; }

        let res = await this.#server.listarSenhas(usuario.id_usuario, dominio, usuario.token.tokenToBase64());
        if (!res || !res.ok || !res.data || res.data.length <= 0) { return undefined; }

        //res.data.forEach(senha => {console.log(senha);});
        return res;
    }

    static async excluirSenha(senha) {
        if (!this.#server || !senha || !senha.dominio || !senha.login || !senha.dominio) { return undefined; }
        let usuario = this.getUsuarioLogado();
        if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0 ||
            !usuario.token || !usuario.token.tokenToBase64() ||
            !senha.id_senha || senha.id_senha <= 0) {
            //exclui a senha localmente
            // cria o Promisse para manter a assinatura do método
            return new Promise((resolve, reject) => {
                let rt = this.#excluirSenhaLocal(senha.dominio, senha.login);
                resolve({ ok: rt, msg: undefined });
            });
        }

        let res = await this.#server.deletarSenha(senha.id_senha, usuario.id_usuario, senha.dominio, usuario.token.tokenToBase64());
        if (!res || !res.ok) { return undefined; }
        return res;
    }

    static async updateInsertSenhasLocais() {
        if (!this.#server) { return undefined; }
        let usuario = this.getUsuarioLogado();
        if (!usuario || !usuario.id_usuario || usuario.id_usuario <= 0 ||
            !usuario.token || !usuario.token.tokenToBase64()) {
            return undefined;
        }

        // senhas da memória do browser
        let senhas = this.#recuperarSenhasLocal();
        if (!senhas || senhas.length <= 0) { return undefined; }

        let res = await this.#server.updateInsertSenhas(
            senhas, usuario.id_usuario, usuario.token.tokenToBase64()
        );
        return res;
    }

    //-------------------
    // Local Data Browser
    //-------------------
    // #id_senha; #id_usuario; #dominio; #login; #senha;
    static #saveSenhasLocal(senha) {
        if (!senha || !senha.login || !senha.senha || !senha.dominio) { return false; }

        let data = this.#recuperarSenhasLocal();
        if (!data) { data = []; }

        let auxDataSenhas = data.filter(
            item => {
                return !!item && !!item.dominio && !!item.login &&
                    item.dominio.toLowerCase().trim() === senha.dominio.toLowerCase().trim() &&
                    item.login.toLowerCase().trim() === senha.login.toLowerCase().trim()
            }
        );

        // sem usuário para esse domínio
        if (!!auxDataSenhas && auxDataSenhas.length <= 0) {
            data.push(senha);
            this.#saveDataSenhas(data);
            return true;
        }

        // atualizar a senha e salvar a base
        for (let i = 0; i < data.length; i++) {
            let auxItem = data[i];
            if (!auxItem || !auxItem.login || !auxItem.dominio) { continue; }
            if (auxItem.dominio.toLowerCase().trim() !== senha.dominio.toLowerCase().trim()) { continue; }
            if (auxItem.login.toLowerCase().trim() !== senha.login.toLowerCase().trim()) { continue; }

            auxItem.senha = senha.senha;
            data[i] = auxItem;
            break;
        }

        if (!data || data.length <= 0) {
            this.clearSenhasLocal();
            return false;
        }

        this.#saveDataSenhas(data);
        return true;
    }

    static #recuperarSenhasDominioLocal(dominio, filtroLogin) {
        if (!dominio) { return []; }
        dominio = dominio.toLowerCase().trim();
        if (!dominio || dominio.length <= 0) { return []; }
        let dataSenhas = this.#recuperarSenhasLocal();
        if (!dataSenhas) { return []; }

        let rt = dataSenhas.filter(
            item => {
                return !!item && !!item.dominio && item.dominio.toLowerCase().trim() === dominio
            }
        );
        if (!rt || rt.length <= 0) { return []; }

        if (!!filtroLogin && filtroLogin.length > 0) {
            filtroLogin = filtroLogin.toLowerCase().trim();
            rt = rt.filter(
                item => {
                    return !!item && !!item.login && item.login.toLowerCase().trim().indexOf(filtroLogin) >= 0
                }
            );
        }

        return !rt || rt.length <= 0 ? [] : rt;
    }

    static #recuperarSenhasLocal() {
        let rt = localStorage["dataSenhas"];
        if (!rt) { return undefined; }
        try {
            rt = JSON.parse(atob(rt));
        } catch (error) {
            this.clearSenhasLocal();
            return undefined;
        }
        if (!rt) { return undefined; }
        let data = [];
        rt.forEach(s => {
            if (this.#isEmpty(s)) { return; }
            data.push(Senha.fromJsonSerialize(s));
        });
        return data;
    }

    static #excluirSenhaLocal(dominio, login) {
        if (!dominio || !login) { return false; }
        dominio = dominio.toLowerCase().trim();
        login = login.toLowerCase().trim();
        if (!dominio || dominio.length <= 0 || !login || login.length <= 0) { return false; }
        let data = this.#recuperarSenhasLocal();
        if (!data || data.length <= 0) { return false; }

        let indexRemover = data.findIndex(item =>
            !!item && !!item.dominio && item.dominio.toLowerCase().trim() === dominio &&
            !!item.login && item.login.toLowerCase().trim() === login
        );
        if (indexRemover < 0) { return false; }
        data.splice(indexRemover, 1);
        this.#saveDataSenhas(data);
        return true;
    }

    static clearSenhasLocal() {
        localStorage.removeItem("dataSenhas");
    }


    // static #removeInvalid(data) {
    //     if (!data || data.length <= 0) { return data; }
    //     let indexRemover = data.findIndex(item => this.#isEmpty(item));
    //     while (indexRemover >= 0) {
    //         data.splice(indexRemover, 1);
    //         indexRemover = data.findIndex(item => this.#isEmpty(item));
    //     }
    //     return data;
    // }

    static #saveDataSenhas(data) {
        if (!data || data.length <= 0) { return; }
        let aux = [];
        data.forEach(s => {
            if (!s) { return; }
            let sJson = s.toJsonSerialize();
            if (!sJson) { return; }
            aux.push(sJson);
        });
        if (!aux || aux.length <= 0) { return; }
        localStorage["dataSenhas"] = btoa(JSON.stringify(aux));
    }

    static #isEmpty(obj) { return !obj || Object.keys(obj).length === 0; }

}