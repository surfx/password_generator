/**
 * REST API client for Python backend
 * Extends ServerBase with HTTP/Fetch communication
 */
class ServerPython extends ServerBase {
    _url = "http://127.0.0.1:8000/";

    _fetch(url, options = {}) {
        return fetch(url, {
            ...options,
            headers: { "Content-type": "application/json; charset=UTF-8", ...options.headers }
        }).then(res => res.json());
    }

    async _sendLogin(login, senha) {
        return await this._fetch(`${this._url}userservice/?tipo=login`, {
            method: "POST",
            body: JSON.stringify({ login, senha })
        });
    }

    async _sendGetToken(login, senha) {
        return await this._fetch(`${this._url}authenticacao/?tipo=token`, {
            method: "POST",
            body: JSON.stringify({ login, senha })
        });
    }

    async _sendExcluirTokensInvalidos() {
        return await this._fetch(`${this._url}authenticacao/?tipo=tokensinvalidos`, {
            method: "POST",
            body: undefined
        });
    }

    async _sendTokenValido(token) {
        return await this._fetch(`${this._url}userservice/?tipo=tokenvalido`, {
            method: "GET",
            headers: { authorization: token }
        });
    }

    async _sendLogout(token) {
        return await this._fetch(`${this._url}userservice/?tipo=logout`, {
            method: "POST",
            headers: { authorization: token }
        });
    }

    async _sendListUsers(token) {
        return await this._fetch(`${this._url}userservice/?tipo=listuser`, {
            method: "POST",
            headers: { authorization: token }
        });
    }

    async _sendInsertUser(nome, login, senha) {
        return await this._fetch(`${this._url}userservice/?tipo=insert`, {
            method: "POST",
            body: JSON.stringify({ nome, login, senha })
        });
    }

    async _sendUpdateUser(usuario_obj, token) {
        return await this._fetch(`${this._url}userservice/?tipo=update`, {
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
            headers: { authorization: token }
        });
    }

    async _sendUpdateUserPart(usuario_obj, token) {
        return await this._fetch(`${this._url}userservice/?tipo=update_part`, {
            method: "POST",
            body: JSON.stringify({
                id_usuario: usuario_obj.id_usuario,
                nome: usuario_obj.nome,
                uuid: usuario_obj.uuid,
                login: usuario_obj.login,
                senha: usuario_obj.senha
            }),
            headers: { authorization: token }
        });
    }

    async _sendInativarUsuario(id_usuario, uuid, login, token) {
        return await this._fetch(`${this._url}userservice/?tipo=inativar`, {
            method: "POST",
            body: JSON.stringify({ id_usuario, uuid, login }),
            headers: { authorization: token }
        });
    }

    async _sendListarSenhas(id_usuario, dominio, token) {
        return await this._fetch(`${this._url}senhas/?tipo=listar`, {
            method: "POST",
            body: JSON.stringify({ id_usuario, dominio }),
            headers: { authorization: token }
        });
    }

    async _sendListarSenhasRaw(id_usuario, dominio, token) {
        return await this._fetch(`${this._url}senhas/?tipo=listar`, {
            method: "POST",
            body: JSON.stringify({ id_usuario, dominio: dominio || "" }),
            headers: { authorization: token }
        });
    }

    async _sendSalvarSenha(id_usuario, dominio, login, senha, token) {
        return await this._fetch(`${this._url}senhas/?tipo=salvar`, {
            method: "POST",
            body: JSON.stringify({ id_usuario, dominio, login, senha }),
            headers: { authorization: token }
        });
    }

    async _sendAtualizarSenha(id_senha, id_usuario, dominio, login, senha, token) {
        return await this._fetch(`${this._url}senhas/?tipo=editar`, {
            method: "POST",
            body: JSON.stringify({ id_senha, id_usuario, dominio, login, senha }),
            headers: { authorization: token }
        });
    }

    async _sendDeletarSenha(id_senha, id_usuario, dominio, token) {
        return await this._fetch(`${this._url}senhas/?tipo=excluir`, {
            method: "POST",
            body: JSON.stringify({ id_senha, id_usuario, dominio }),
            headers: { authorization: token }
        });
    }

    async _sendUpdateInsertSenhas(senhas, id_usuario, token) {
        const body = '[' + senhas.map(s => s.toJsonSerialize ? s.toJsonSerialize() : JSON.stringify(s)).join(',') + ']';
        return await this._fetch(`${this._url}senhas/?tipo=update_insert`, {
            method: "POST",
            body,
            headers: { authorization: token, id_usuario }
        });
    }

    async _sendFetchDataUK() {
        return fetch("https://api.coronavirus.data.gov.uk/v1/data", { method: "GET" });
    }

    async _sendTestesCORS() {
        return await this._fetch(`${this._url}testes/?tipo=cors`, { method: "POST" });
    }
}
