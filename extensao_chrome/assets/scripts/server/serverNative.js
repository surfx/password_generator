/**
 * Native messaging client for Chrome extension
 * Extends ServerBase with chrome.runtime.sendNativeMessage communication
 */
class ServerNative extends ServerBase {
    _NATIVE_HOST = "com.emerson.password_generator";

    async _send(action, payload) {
        console.log(`[Native] Enviando ação: ${action}`, payload);
        
        return new Promise((resolve) => {
            try {
                chrome.runtime.sendNativeMessage(this._NATIVE_HOST, {
                    action: action,
                    payload: payload
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("[Native] ERRO:", chrome.runtime.lastError.message);
                        resolve({ ok: false, msg: "Erro Native: " + chrome.runtime.lastError.message });
                    } else {
                        console.log("[Native] Resposta recebida:", response);
                        resolve(response);
                    }
                });
            } catch (e) {
                console.error("[Native] Exception:", e);
                resolve({ ok: false, msg: "Exceção: " + e.message });
            }
        });
    }

    async log(level, message, details = "") {
        try {
            await this._send("log", { level, message, details });
        } catch (e) {
            console.error("Failed to send log:", e);
        }
    }

    async _sendLogin(login, senha) {
        return await this._send("login", { login, senha });
    }

    async _sendGetToken(login, senha) {
        return await this._send("get_token", { login, senha });
    }

    async _sendExcluirTokensInvalidos() {
        return await this._send("tokensinvalidos", {});
    }

    async _sendTokenValido(token) {
        return await this._send("tokenvalido", { authorization: token });
    }

    async _sendLogout(token) {
        return await this._send("logout", { authorization: token });
    }

    async _sendListUsers(token) {
        return await this._send("list_users", { authorization: token });
    }

    async _sendInsertUser(nome, login, senha) {
        return await this._send("insert_user", { nome, login, senha });
    }

    async _sendUpdateUser(usuario_obj, token) {
        return await this._send("update_user", { ...usuario_obj, authorization: token });
    }

    async _sendUpdateUserPart(usuario_obj, token) {
        console.log("[Native] Enviando update_user_part:", usuario_obj);
        return await this._send("update_user_part", {
            id_usuario: usuario_obj.id_usuario,
            nome: usuario_obj.nome,
            login: usuario_obj.login,
            senha: usuario_obj.senha,
            authorization: token
        });
    }

    async _sendInativarUsuario(id_usuario, uuid, login, token) {
        return await this._send("inativar_user", { id_usuario, uuid, login, authorization: token });
    }

    async _sendListarSenhas(id_usuario, dominio, token) {
        return await this._send("listar_senhas", { id_usuario, dominio, authorization: token });
    }

    async _sendListarSenhasRaw(id_usuario, dominio, token) {
        return await this._send("listar_senhas", { id_usuario, dominio, authorization: token });
    }

    async _sendSalvarSenha(id_usuario, dominio, login, senha, token) {
        return await this._send("salvar_senha", { id_usuario, dominio, login, senha, authorization: token });
    }

    async _sendAtualizarSenha(id_senha, id_usuario, dominio, login, senha, token) {
        return await this._send("editar_senha", { id_senha, id_usuario, dominio, login, senha, authorization: token });
    }

    async _sendDeletarSenha(id_senha, id_usuario, dominio, token) {
        return await this._send("excluir_senha", { id_senha, id_usuario, dominio, authorization: token });
    }

    async _sendUpdateInsertSenhas(senhas, id_usuario, token) {
        return await this._send("update_insert_senhas", { senhas, id_usuario, authorization: token });
    }

    async _sendFetchDataUK() {
        return fetch("https://api.coronavirus.data.gov.uk/v1/data", { method: "GET" });
    }

    async _sendTestesCORS() {
        return { ok: true, msg: "Native Messaging não usa CORS" };
    }

    async recuperarSenhas(email, senhas) {
        if (!email || !senhas) { return this._toerr("Informe o email e as senhas"); }
        let res = await this._send("recuperar_senhas", { email, senhas });
        return !!res ? res : this._toerr_res(res);
    }
}
