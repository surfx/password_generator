class Token {

    #id; #token; #validade;

    constructor() {
        this.#id = 0;
        this.#token = '';
        this.#validade = '';
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

    tokenToBase64(){
        if (!this.#token){return undefined;}
        return btoa(this.#token);
    }

}