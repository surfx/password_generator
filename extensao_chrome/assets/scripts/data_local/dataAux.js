class DataAux {

    static #server = new ServerPHP();
    static #dtlocal = new DataLocal();

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
            console.log(res.toString());
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
        return !!usuario && !!usuario.id_usuario && usuario.id_usuario > 0 ? usuario : undefined;
    }

    static deslogar(key_user = "usuario_logado") {
        this.#dtlocal.clear(key_user);
    }

}