class DataAux {

    static #dtlocal = new DataLocal();

    //------------------------------
    // usuários
    //------------------------------

    static async loadUser(login, senha, key_user = "usuario_logado") {
        let usuario = await this.getUsuarioLogado(key_user);

        if (!!usuario) {
            if (usuario.login === login && usuario.senha === senha) {
                return usuario;
            }
        }

        // Busca usuários locais
        const data = await chrome.storage.sync.get("users_local");
        let users = data.users_local || [];
        
        let found = users.find(u => u.login === login && u.senha === senha);
        if (found) {
            let userObj = Usuario.from(found);
            await this.saveUser(userObj, key_user);
            return userObj;
        }

        return undefined;
    }

    static async saveUser(usuario, key_user = "usuario_logado") {
        if (!usuario) return;
        
        // Salva como usuário logado no storage local (sessão)
        this.#dtlocal.save_obj(key_user, usuario, u => u.toJsonSerialize());

        // Também salva na lista de usuários do profile (chrome.storage.sync)
        const data = await chrome.storage.sync.get("users_local");
        let users = data.users_local || [];
        
        const index = users.findIndex(u => u.login === usuario.login);
        let userJson = JSON.parse(usuario.toJsonSerialize());
        
        if (index >= 0) {
            users[index] = userJson;
        } else {
            if (!userJson.id_usuario) userJson.id_usuario = Date.now();
            users.push(userJson);
        }
        
        await chrome.storage.sync.set({ "users_local": users });
    }

    static async registerUser(nome, login, senha) {
        let newUser = new Usuario(Date.now(), nome, crypto.randomUUID(), login, senha, true, true);
        await this.saveUser(newUser);
        return { ok: true, msg: "Usuário cadastrado com sucesso", data: newUser };
    }

    static getUsuarioLogado(key_user = "usuario_logado") {
        return this.#dtlocal.load_obj(key_user, Usuario.fromJsonSerialize);
    }

    static async verificarTokenOnline(key_user = "usuario_logado") {
        // Localmente o token é sempre válido se o usuário estiver na sessão
        let usuario = this.getUsuarioLogado(key_user);
        return !!usuario;
    }

    static deslogar(key_user = "usuario_logado") {
        this.#dtlocal.clear(key_user);
    }

    //------------------------------
    // senhas
    //------------------------------
    static async saveSenha(login, senha, dominio) {
        if (!dominio || !login || !senha) return { ok: false, msg: "Dados incompletos" };
        
        let usuario = this.getUsuarioLogado();
        let id_usuario = usuario ? usuario.id_usuario : 'public';

        try {
            const data = await chrome.storage.sync.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            
            let nova = new Senha(Date.now(), id_usuario, dominio, login, senha);
            let objSalvar = JSON.parse(nova.toJsonSerialize());

            const index = atuais.findIndex(a => 
                a.dominio === dominio && a.login === login && a.id_usuario === id_usuario
            );
            
            if (index >= 0) {
                atuais[index] = objSalvar;
            } else {
                atuais.push(objSalvar);
            }
            
            await chrome.storage.sync.set({ "senhas_sync": atuais });
            return { ok: true, msg: "Senha salva com sucesso" };
        } catch (e) {
            console.error("Erro ao salvar senha", e);
            return { ok: false, msg: "Erro ao salvar: " + e.message };
        }
    }

    static async loadSenhas(dominio) {
        let usuario = this.getUsuarioLogado();
        let id_usuario = usuario ? usuario.id_usuario : 'public';

        try {
            const data = await chrome.storage.sync.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            
            let filtradas = atuais.filter(s => 
                s.id_usuario === id_usuario && 
                (!dominio || s.dominio.toLowerCase() === dominio.toLowerCase())
            ).map(s => Senha.from(s));
            
            return { ok: true, data: filtradas };
        } catch (e) {
            console.error("Erro ao carregar senhas", e);
            return { ok: false, msg: "Erro ao carregar: " + e.message };
        }
    }

    static async getSenhasRaw() {
        let usuario = this.getUsuarioLogado();
        let id_usuario = usuario ? usuario.id_usuario : 'public';
        try {
            const data = await chrome.storage.sync.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            let filtradas = atuais.filter(s => s.id_usuario === id_usuario);
            return { ok: true, data: filtradas };
        } catch (e) {
            return { ok: false, msg: e.message };
        }
    }

    static async excluirSenha(senha) {
        if (!senha || !senha.dominio || !senha.login) return { ok: false, msg: "Dados incompletos" };
        
        let usuario = this.getUsuarioLogado();
        let id_usuario = usuario ? usuario.id_usuario : 'public';

        try {
            const data = await chrome.storage.sync.get("senhas_sync");
            let atuais = data.senhas_sync || [];
            
            const novoArray = atuais.filter(s => 
                !(s.id_usuario === id_usuario && s.dominio === senha.dominio && s.login === senha.login)
            );
            
            await chrome.storage.sync.set({ "senhas_sync": novoArray });
            return { ok: true, msg: "Senha excluída" };
        } catch (e) {
            console.error("Erro ao excluir senha", e);
            return { ok: false, msg: "Erro ao excluir: " + e.message };
        }
    }

    // Mantido para compatibilidade se necessário, mas agora é um no-op ou redireciona
    static async updateInsertSenhasLocais() {
        return { ok: true };
    }

    static clearSenhasLocal() {
        // No-op agora que usamos sync
    }

}
