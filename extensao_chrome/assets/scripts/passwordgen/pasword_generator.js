const data = {
    minusculas: [...'abcdefghijklmnopqrstuvwxyz'],
    maiusculas: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    numeros: [...'0123456789'],
    caracteresEspeciais: [...'!@#$%&*+-*/ ']
}

// https://www.freecodecamp.org/news/how-to-shuffle-an-array-of-items-using-javascript-or-typescript/
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


export function gerarSenha(size, addNumeros, addCaracteresEspeciais, addMaiusculas, addMinusculas) {
    if (!size || size <= 0) { size = 15; }
    let dbChars = [];
    if (!!addNumeros) { dbChars = [...dbChars, ...data.numeros]; }
    if (!!addCaracteresEspeciais) { dbChars = [...dbChars, ...data.caracteresEspeciais]; }
    if (addMaiusculas) { dbChars = [...dbChars, ...data.maiusculas]; }
    if (addMinusculas) { dbChars = [...dbChars, ...data.minusculas]; }
    if (dbChars.length <= 0) { return ''; }

    let rt = '';
    while (rt.length < size) {
        let pos = Math.floor(Math.random() * dbChars.length);
        dbChars = shuffle(dbChars);
        rt += dbChars[pos];
    }
    return rt;
}
