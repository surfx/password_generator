let txtPassword = document.getElementById('txtPassword');

let slider = document.getElementById("mySlider");
let output = document.getElementById("spnValorSlider");
output.innerHTML = slider.value; // Display the default slider value

let chkCaracteresEspeciais = document.getElementById('chkCaracteresEspeciais');
let chkNumeros = document.getElementById('chkNumeros');
let chkMaiusculas = document.getElementById('chkMaiusculas');
let chkMinusculas = document.getElementById('chkMinusculas');

let spnMensagem = document.getElementById('spnMensagem');

data = {
    minusculas: [...'abcdefghijklmnopqrstuvwxyz'],
    maiusculas: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    numeros: [...'012345678909'],
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

function showMsg(mensagem) {
    spnMensagem.innerHTML = mensagem;
    setTimeout(() => {
        spnMensagem.innerHTML = '';
    }, 1000);
}

function gerarSenha() {
    txtPassword.value = '';
    let size = slider.value;
    if (size <= 0) { return; }
    let dbChars = [];
    if (chkNumeros.checked) {
        dbChars = [...dbChars, ...data.numeros];
    }
    if (chkCaracteresEspeciais.checked) {
        dbChars = [...dbChars, ...data.caracteresEspeciais];
    }
    if (chkMaiusculas.checked) {
        dbChars = [...dbChars, ...data.maiusculas];
    }
    if (chkMinusculas.checked) {
        dbChars = [...dbChars, ...data.minusculas];
    }
    if (dbChars.length <= 0) { return; }

    let rt = '';
    while (rt.length <= size) {
        let pos = Math.floor(Math.random() * dbChars.length);
        dbChars = shuffle(dbChars);
        rt += dbChars[pos];
    }
    txtPassword.value = rt;
}

// https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
const unsecuredCopyToClipboard = (text) => { const textArea = document.createElement("textarea"); textArea.value=text; document.body.appendChild(textArea); textArea.focus();textArea.select(); try{document.execCommand('copy')}catch(err){console.error('Unable to copy to clipboard',err)}document.body.removeChild(textArea)};

/**
 * Copies the text passed as param to the system clipboard
 * Check if using HTTPS and navigator.clipboard is available
 * Then uses standard clipboard API, otherwise uses fallback
*/
const copyToClipboard = (content) => {
  if (window.isSecureContext && navigator.clipboard) {
    navigator.clipboard.writeText(content);
  } else {
    unsecuredCopyToClipboard(content);
  }
};

function copiarParaAreaTransferencia(){
    copyToClipboard(txtPassword.value);
    showMsg('Copiado para a área de transferência');
}

chkCaracteresEspeciais.onchange = gerarSenha;
chkNumeros.onchange = gerarSenha;
chkMaiusculas.onchange = gerarSenha;
chkMinusculas.onchange = gerarSenha;

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function () {
    output.innerHTML = this.value;
    gerarSenha();
}

document.getElementById('btnRefresh').onclick = gerarSenha;
document.getElementById('btnCopy').onclick = copiarParaAreaTransferencia;
document.getElementById('btnCopiar').onclick = copiarParaAreaTransferencia;

gerarSenha();
