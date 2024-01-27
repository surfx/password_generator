class Usuario {

    #id_usuario; #nome; #uuid;
    #login; #verificado; #ativo;
    #token;

    constructor() {
        this.#id_usuario = 0;
        this.#nome = '';
        this.#uuid = '';
        this.#login = '';
        this.#verificado = false;
        this.#ativo = false;
        this.#token = undefined;
    }

    get id_usuario() { return this.#id_usuario; }
    set id_usuario(valor) { this.#id_usuario = valor; }
    get nome() { return this.#nome; }
    set nome(valor) { this.#nome = valor; }
    get uuid() { return this.#uuid; }
    set uuid(valor) { this.#uuid = valor; }
    get login() { return this.#login; }
    set login(valor) { this.#login = valor; }
    get verificado() { return this.#verificado; }
    set verificado(valor) { this.#verificado = valor; }
    get ativo() { return this.#ativo; }
    set ativo(valor) { this.#ativo = valor; }
    get token() { return this.#token; }
    set token(valor) { this.#token = valor; }

    static from(json) {
        let rt = Object.assign(new Usuario(), json);
        if (!!json.token){
            rt.#token = Object.assign(new Token(), json.token);
        }
        return rt;
    }

    toString() {
        let tk = !!this.#token ? this.#token.toString() : "nulo";
        return `${this.#id_usuario}, ${this.#nome}, ${this.#uuid}, ${this.#login}, ${this.#verificado}, ${this.#ativo}, {${tk}}`;
    }

}