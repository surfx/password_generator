class Usuario {

    #id_usuario; #nome; #uuid;
    #login; #senha; #verificado; #ativo;
    #token;

    constructor(
        id_usuario = 0,
        nome = '',
        uuid = '',
        login = '',
        senha = '',
        verificado = false,
        ativo = false,
        token = undefined
    ) {
        this.#id_usuario = id_usuario;
        this.#nome = nome;
        this.#uuid = uuid;
        this.#login = login;
        this.#senha = senha;
        this.#verificado = verificado;
        this.#ativo = ativo;
        this.#token = token;
    }

    get id_usuario() { return this.#id_usuario; }
    set id_usuario(valor) { this.#id_usuario = valor; }
    get nome() { return this.#nome; }
    set nome(valor) { this.#nome = valor; }
    get uuid() { return this.#uuid; }
    set uuid(valor) { this.#uuid = valor; }
    get login() { return this.#login; }
    set login(valor) { this.#login = valor; }
    get senha() { return this.#senha; }
    set senha(valor) { this.#senha = valor; }
    get verificado() { return this.#verificado; }
    set verificado(valor) { this.#verificado = valor; }
    get ativo() { return this.#ativo; }
    set ativo(valor) { this.#ativo = valor; }
    get token() { return this.#token; }
    set token(valor) { this.#token = valor; }

    dataValidadeToken() {
        if (!this.#token || !this.#token.id || this.#token.id <= 0 ||
            !this.#token.token || !this.#token.validade ||
            this.#token.validade.length < 19) {
            return undefined;
        }

        let validade = (this.#token.validade).trim();
        let dtV = validade.substring(0, 10);
        let hrV = validade.substring(11);

        let anoV = parseInt(dtV.substring(0, 4));
        let mesV = parseInt(dtV.substring(5, 7));
        let diaV = parseInt(dtV.substring(8, 10));

        let horaV = parseInt(hrV.substring(0, 2));
        let minV = parseInt(hrV.substring(3, 5));
        let segV = parseInt(hrV.substring(6, 8));

        return new Date(anoV, mesV - 1, diaV, horaV, minV, segV);
    }

    static from(json) {
        let rt = Object.assign(new Usuario(), json);
        if (!!json.token) {
            rt.#token = Object.assign(new Token(), json.token);
        }
        return rt;
    }

    toString() {
        let tk = !!this.#token ? this.#token.toString() : "nulo";
        return `${this.#id_usuario}, ${this.#nome}, ${this.#uuid}, ${this.#login}, ${this.#senha}, ${this.#verificado}, ${this.#ativo}, {${tk}}`;
    }

    //------------
    // Serializar
    //------------
    toJsonSerialize() {
        return JSON.stringify(
            {
                id_usuario: this.#id_usuario, nome: this.#nome, uuid: this.#uuid,
                login: this.#login, senha: this.#senha, verificado: this.#verificado,
                ativo: this.#ativo,
                token: !!this.#token ? this.#token.toJsonSerialize() : undefined
            }
        );
    };

    static fromJsonSerialize(json) {
        if (!json) { return undefined; }
        let js = JSON.parse(json);
        if (!js) { return undefined; }

        return new Usuario(
            js.id_usuario, js.nome, js.uuid,
            js.login, js.senha, js.verificado,
            js.ativo, Token.fromJsonSerialize(js.token)
        );
    }

}