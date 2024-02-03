class Senha {

    #id_senha;
    #id_usuario;
    #dominio;
    #login;
    #senha;

    constructor(
        id_senha = 0, id_usuario = '', 
        dominio = '', login = '', senha = ''
    ) {
        this.#id_senha = id_senha;
        this.#id_usuario = id_usuario;
        this.#dominio = dominio;
        this.#login = login;
        this.#senha = senha;
    }

    get id_senha() { return this.#id_senha; }
    set id_senha(valor) { this.#id_senha = valor; }
    get id_usuario() { return this.#id_usuario; }
    set id_usuario(valor) { this.#id_usuario = valor; }
    get dominio() { return this.#dominio; }
    set dominio(valor) { this.#dominio = valor; }
    get login() { return this.#login; }
    set login(valor) { this.#login = valor; }
    get senha() { return this.#senha; }
    set senha(valor) { this.#senha = valor; }

    static from(json) {
        return Object.assign(new Senha(), json);
    }

    toString() {
        return `id_senha: ${this.#id_senha}, id_usuario: ${this.#id_usuario}, dominio: ${this.#dominio}, login: ${this.#login}, senha: ${this.#senha}`;
    }

    //------------
    // Serializar
    //------------
    toJsonSerialize() {
        return JSON.stringify(
            {
                id_senha: this.#id_senha,
                id_usuario: this.#id_usuario, 
                dominio: this.#dominio,
                login: this.#login, 
                senha: this.#senha
            }
        );
    };

    static fromJsonSerialize(json) {
        if (!json) { return undefined; }
        let js = JSON.parse(json);
        if (!js) { return undefined; }

        return new Senha(
            js.id_senha, js.id_usuario, js.dominio,
            js.login, js.senha
        );
    }

}