class Erro {

    #ok; #msg;

    constructor(ok = true, msg = '') {
        this.#ok = ok;
        this.#msg = msg;
    }

    get ok() { return this.#ok; }
    set ok(valor) { this.#ok = valor; }
    get msg() { return this.#msg; }
    set msg(valor) { this.#msg = valor; }

    static from(json) {
        return Object.assign(new Erro(), json);
    }

    toString() {
        return `ok: ${this.#ok}, mensagem: ${this.#msg}`;
    }

}