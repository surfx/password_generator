class Token {

    #id; #token; #validade;

    constructor(
        id = 0,
        token = '',
        validade = ''
    ) {
        this.#id = id;
        this.#token = token;
        this.#validade = validade;
    }

    get id() { return this.#id; }
    set id(valor) { this.#id = valor; }
    get token() { return this.#token; }
    set token(valor) { this.#token = valor; }
    get validade() { return this.#validade; }
    set validade(valor) { this.#validade = valor; }

    static from(json) {
        return Object.assign(new Token(), json);
    }

    toString() {
        return `${this.#id}, ${this.#token}, ${this.#validade}`;
    }

    tokenToBase64() {
        if (!this.#token) { return undefined; }
        return btoa(this.#token);
    }

    //------------
    // Serializar
    //------------
    toJsonSerialize() {
        return JSON.stringify({ id: this.#id, token: this.#token, validade: this.#validade });
    };

    static fromJsonSerialize(json) {
        if (!json) { return undefined; }
        let js = JSON.parse(json);
        if (!js) { return undefined; }
        return new Token(js.id, js.token, js.validade);
    }

}