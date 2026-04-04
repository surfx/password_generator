/**
 * Base class for server communication
 * Handles common validation, error handling, and entity serialization
 */
class ServerBase {
    _toerr(msg = undefined) {
        msg = !!msg ? msg : "Erro";
        return new Promise((resolve) => { resolve(new Erro(false, msg)); });
    }

    _toerr_res(res) {
        if (!res || res === undefined || res === 'undefined') { 
            return { "ok": false, "msg": "Erro - null" }; 
        }
        if (!res.ok) { return Erro.from(res); }
        if (!res.data) { return { "ok": true, "data": undefined, "msg": res.msg }; }
        return undefined;
    }

    _parseResponse(res) {
        if (!res) { return this._toerr_res(res); }
        const err = this._toerr_res(res); 
        if (!!err) { return err; }
        return res;
    }

    _parseUserResponse(res) {
        const parsed = this._parseResponse(res);
        if (parsed && !parsed.ok) { return parsed; }
        if (res.data) { res.data = Usuario.from(res.data); }
        if (res.data && res.token) { res.data.token = Token.from(res.token); }
        return res;
    }

    _parseUsersResponse(res) {
        const parsed = this._parseResponse(res);
        if (parsed && !parsed.ok) { return parsed; }
        let data = [];
        if (res.data && Array.isArray(res.data)) {
            res.data.forEach(element => { data.push(Usuario.from(element)); });
        }
        res.data = data;
        return res;
    }

    _parsePasswordsResponse(res) {
        const parsed = this._parseResponse(res);
        if (parsed && !parsed.ok) { return parsed; }
        let data = [];
        if (res.data && Array.isArray(res.data)) {
            res.data.forEach(element => { data.push(Senha.from(element)); });
        }
        res.data = data;
        return res;
    }

    _parseSinglePasswordResponse(res) {
        const parsed = this._parseResponse(res);
        if (parsed && !parsed.ok) { return parsed; }
        res.data = !!res.data ? Senha.from(res.data) : undefined;
        return res;
    }

    async doLogin(login, senha) {
        await this.excluirTokensInvalidos();
        if (!login || !senha) { return this._toerr("Informe o login e a senha"); }
        const res = await this._sendLogin(login, senha);
        return this._parseUserResponse(res);
    }

    async getToken(login, senha) {
        if (!login || !senha) { return this._toerr("Informe o login e a senha"); }
        const res = await this._sendGetToken(login, senha);
        const parsed = this._parseResponse(res);
        if (parsed && !parsed.ok) { return parsed; }
        res.data = !!res.data ? Token.from(res.data) : undefined;
        return res;
    }

    async excluirTokensInvalidos() {
        const res = await this._sendExcluirTokensInvalidos();
        return this._parseResponse(res);
    }

    async tokenValido(token) {
        if (!token) { return this._toerr("Informe o token em base 64"); }
        const res = await this._sendTokenValido(token);
        return this._parseResponse(res);
    }

    async doLogout(token) {
        if (!token) { return this._toerr("Informe o token em base 64"); }
        const res = await this._sendLogout(token);
        return this._parseResponse(res);
    }

    async listUsers(token) {
        if (!token) { return this._toerr("Informe o token em base 64"); }
        const res = await this._sendListUsers(token);
        return this._parseUsersResponse(res);
    }

    async insertUser(nome, login, senha) {
        if (!nome || !login || !senha) { 
            return this._toerr("Informe o nome, login e senha"); 
        }
        const res = await this._sendInsertUser(nome, login, senha);
        return this._parseUserResponse(res);
    }

    async updateUser(usuario_obj, token) {
        if (!token || !usuario_obj || !usuario_obj.id_usuario) { 
            return this._toerr("Informe os dados do usuário"); 
        }
        const res = await this._sendUpdateUser(usuario_obj, token);
        return this._parseUserResponse(res);
    }

    async updateUserPart(usuario_obj, token) {
        if (!token || !usuario_obj || !usuario_obj.id_usuario) { 
            return this._toerr("Informe os dados do usuário"); 
        }
        const res = await this._sendUpdateUserPart(usuario_obj, token);
        return this._parseUserResponse(res);
    }

    async inativarUsuario(id_usuario, uuid, login, token) {
        if (!token || !id_usuario) { 
            return this._toerr("Informe os dados"); 
        }
        const res = await this._sendInativarUsuario(id_usuario, uuid, login, token);
        return this._parseUserResponse(res);
    }

    async listarSenhas(id_usuario, dominio, token) {
        if (!token || !id_usuario) { return this._toerr("Informe os dados"); }
        const res = await this._sendListarSenhas(id_usuario, dominio, token);
        return this._parsePasswordsResponse(res);
    }

    async listarSenhasRaw(id_usuario, dominio, token) {
        if (!token || !id_usuario) { return this._toerr("Informe os dados"); }
        return await this._sendListarSenhasRaw(id_usuario, dominio, token);
    }

    async salvarSenha(id_usuario, dominio, login, senha, token) {
        if (!token || !id_usuario) { return this._toerr("Informe os dados"); }
        const res = await this._sendSalvarSenha(id_usuario, dominio, login, senha, token);
        return this._parseSinglePasswordResponse(res);
    }

    async atualizarSenha(id_senha, id_usuario, dominio, login, senha, token) {
        if (!token || !id_senha) { return this._toerr("Informe os dados da senha"); }
        const res = await this._sendAtualizarSenha(id_senha, id_usuario, dominio, login, senha, token);
        return this._parseSinglePasswordResponse(res);
    }

    async deletarSenha(id_senha, id_usuario, dominio, token) {
        if (!token || !id_senha) { return this._toerr("Informe os dados para excluir a senha"); }
        const res = await this._sendDeletarSenha(id_senha, id_usuario, dominio, token);
        return this._parseSinglePasswordResponse(res);
    }

    async updateInsertSenhas(senhas, id_usuario, token) {
        if (!token || !senhas) { return this._toerr("Informe os dados"); }
        const senhas_plain = senhas.map(s => {
            if (s && typeof s.toJsonSerialize === 'function') {
                try { return JSON.parse(s.toJsonSerialize()); } 
                catch(e) { return s; }
            }
            return s;
        });
        const res = await this._sendUpdateInsertSenhas(senhas_plain, id_usuario, token);
        return this._parseResponse(res);
    }

    async fetchDataUK() {
        const res = await this._sendFetchDataUK();
        return await res.json();
    }

    async testescors() {
        const res = await this._sendTestesCORS();
        return this._parseResponse(res);
    }

    // Abstract methods - to be implemented by subclasses
    async _sendLogin(login, senha) { throw new Error("Not implemented"); }
    async _sendGetToken(login, senha) { throw new Error("Not implemented"); }
    async _sendExcluirTokensInvalidos() { throw new Error("Not implemented"); }
    async _sendTokenValido(token) { throw new Error("Not implemented"); }
    async _sendLogout(token) { throw new Error("Not implemented"); }
    async _sendListUsers(token) { throw new Error("Not implemented"); }
    async _sendInsertUser(nome, login, senha) { throw new Error("Not implemented"); }
    async _sendUpdateUser(usuario_obj, token) { throw new Error("Not implemented"); }
    async _sendUpdateUserPart(usuario_obj, token) { throw new Error("Not implemented"); }
    async _sendInativarUsuario(id_usuario, uuid, login, token) { throw new Error("Not implemented"); }
    async _sendListarSenhas(id_usuario, dominio, token) { throw new Error("Not implemented"); }
    async _sendListarSenhasRaw(id_usuario, dominio, token) { throw new Error("Not implemented"); }
    async _sendSalvarSenha(id_usuario, dominio, login, senha, token) { throw new Error("Not implemented"); }
    async _sendAtualizarSenha(id_senha, id_usuario, dominio, login, senha, token) { throw new Error("Not implemented"); }
    async _sendDeletarSenha(id_senha, id_usuario, dominio, token) { throw new Error("Not implemented"); }
    async _sendUpdateInsertSenhas(senhas, id_usuario, token) { throw new Error("Not implemented"); }
    async _sendFetchDataUK() { throw new Error("Not implemented"); }
    async _sendTestesCORS() { throw new Error("Not implemented"); }
}
