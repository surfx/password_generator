class DataAux {

    //static #server = new ServerPHP();
    static #server = (() => {
        if (typeof ServerNative !== 'undefined') return new ServerNative();
        if (typeof ServerPython !== 'undefined') return new ServerPython();
        if (typeof ServerPHP !== 'undefined') return new ServerPHP();
        return null;
    })();
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

        if (!this.#server) return undefined;

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
            usuario.token.validade.length < 19) { 
            this.deslogar(key_user);
            return undefined;
        }
        return usuario;
    }

    static async verificarTokenOnline(key_user = "usuario_logado") {
        let usuario = this.getUsuarioLogado(key_user);
        if (!usuario) return false;

        if (!this.#server) return false;

        let res = await this.#server.tokenValido(usuario.token.tokenToBase64());
        
        if (!res || !res.ok) {
            this.deslogar(key_user);
            return false;
        }
        return true;
    }

    static deslogar(key_user = "usuario_logado") {
        // Carrega o usuário diretamente do local storage para evitar recursão com getUsuarioLogado
        let usuario = this.#dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);
        
        if (usuario && usuario.token && usuario.token.tokenToBase64()) {
            // Tenta fazer o logout no servidor, mas não impede a limpeza local
            if (this.#server) {
                this.#server.doLogout(usuario.token.tokenToBase64()).catch(err => {
                    console.error("Erro ao tentar deslogar no servidor:", err);
                });
            }
        }
        
        // Limpa o usuário do local storage incondicionalmente
        this.#dtlocal.clear(key_user);
    }

    static inativarUsuario(key_user = "usuario_logado"){
        let usuario = this.getUsuarioLogado();
        //console.log(usuario);
        if (!usuario){
            this.deslogar(key_user);
            return { ok: false, msg: "Erro ao deslogar" };
        }

        if (!this.#server) return { ok: false, msg: "Server não definido" };

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

        if (!usuario || !usuario.id_usuario || !usuario.token || !usuario.token.tokenToBase64()) {
            // recupera as senhas localmente
            // cria o Promisse para manter a assinatura do método
            return new Promise((resolve, reject) => {
                let rt = this.#recuperarSenhasDominioLocal(dominio, undefined);
                resolve({ ok: true, msg: undefined, data: rt });
            });
        }

        let res = await this.#server.listarSenhas(usuario.id_usuario, dominio, usuario.token.tokenToBase64());
        if (!res || !res.ok || !res.data || res.data.length <= 0) { return undefined; }

        // Sincroniza com o storage compartilhado para automação
        this.#syncToChromeStorage(res.data);

        //res.data.forEach(senha => {console.log(senha);});
        return res;
    }

    static async #syncToChromeStorage(novasSenhas) {
        if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) return;
        
        try {
            const data = await chrome.storage.local.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            
            novasSenhas.forEach(nova => {
                // Converte instância de Senha para objeto plano (POJO)
                // Campos privados (#) não são serializados automaticamente pelo Chrome
                let objSalvar = nova;
                if (nova.constructor.name === 'Senha' || typeof nova.toJsonSerialize === 'function') {
                    objSalvar = {
                        id_senha: nova.id_senha,
                        id_usuario: nova.id_usuario,
                        dominio: nova.dominio,
                        login: nova.login,
                        senha: nova.senha
                    };
                }
                
                const index = atuais.findIndex(a => 
                    (a.id_senha && objSalvar.id_senha && a.id_senha === objSalvar.id_senha) ||
                    (a.dominio === objSalvar.dominio && a.login === objSalvar.login)
                );
                
                if (index >= 0) {
                    atuais[index] = objSalvar;
                } else {
                    atuais.push(objSalvar);
                }
            });
            
            await chrome.storage.local.set({ "senhas_sync": atuais });
        } catch (e) {
            console.error("Erro ao sincronizar storage", e);
        }
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
        
        // Remove do storage sync também
        this.#removeFromChromeStorage(senha);
        
        return res;
    }
    
    static async #removeFromChromeStorage(senhaRemover) {
        if (typeof chrome === 'undefined' || !chrome || !chrome.storage || !chrome.storage.local) return;
        try {
            const data = await chrome.storage.local.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            const novoArray = atuais.filter(s => 
                !((s.id_senha && senhaRemover.id_senha && s.id_senha === senhaRemover.id_senha) ||
                  (s.dominio === senhaRemover.dominio && s.login === senhaRemover.login))
            );
            await chrome.storage.local.set({ "senhas_sync": novoArray });
        } catch(e) { console.error(e); }
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
        
        // Sincroniza também as locais
        this.#syncToChromeStorage(aux);
    }

    static #isEmpty(obj) { return !obj || Object.keys(obj).length === 0; }

}