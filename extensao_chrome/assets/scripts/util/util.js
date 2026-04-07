export const getUrl = (urlCompleta) => {
    return new Promise((resolve, reject) => {

        if (typeof chrome === 'undefined' || !chrome || !chrome.tabs || !chrome.tabs.query) {
            resolve('TESTE');
            return;
        }

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            if (!tabs || tabs.length <= 0) {
                // Tenta buscar na janela atual se a lastFocusedWindow falhar
                chrome.tabs.query({ active: true, currentWindow: true }, tabs2 => {
                    if (!tabs2 || tabs2.length <= 0) {
                        resolve('');
                        return;
                    }
                    processUrl(tabs2[0].url);
                });
                return;
            }
            processUrl(tabs[0].url);
        });

        function processUrl(url) {
            if (!url || typeof url !== 'string') {
                resolve('');
                return;
            }
            if (!urlCompleta) {
                try {
                    const urlObj = new URL(url);
                    url = urlObj.hostname;
                    if (url.startsWith('www.')) {
                        url = url.substring(4);
                    }
                } catch (e) {
                    // Fallback
                    url = url.replace('https://', '').replace('http://', '').replace('www.', '');
                    if (url.indexOf('/') >= 0) {
                        url = url.substring(0, url.indexOf("/"));
                    }
                }
            }
            resolve(url);
        }
    });
}

// https://stackoverflow.com/questions/71873824/copy-text-to-clipboard-cannot-read-properties-of-undefined-reading-writetext
const unsecuredCopyToClipboard = (text) => { const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.focus(); textArea.select(); try { document.execCommand('copy') } catch (err) { console.error('Unable to copy to clipboard', err) } document.body.removeChild(textArea) };

/**
 * Copies the text passed as param to the system clipboard
 * Check if using HTTPS and navigator.clipboard is available
 * Then uses standard clipboard API, otherwise uses fallback
*/
export const copyToClipboard = (content) => {
    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(content);
    } else {
        unsecuredCopyToClipboard(content);
    }
};


let aux;
export function showMsg(alvo, mensagem) {
    if (!alvo) { return; }
    if (!!aux) { clearTimeout(aux); }
    alvo.innerHTML = mensagem;
    aux = setTimeout(() => {
        alvo.innerHTML = '';
    }, 3000);
}

export function showLoading(btn, texto = "Aguarde...") {
    if (!btn) return;
    btn._originalText = btn.textContent || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        ${texto}
    </span>
    <style>@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>`;
}

export function hideLoading(btn) {
    if (!btn || btn._originalText === undefined) return;
    btn.disabled = false;
    btn.innerHTML = btn._originalText;
}

export function withLoading(btn, asyncFn, texto = "Aguarde...") {
    return async function(...args) {
        showLoading(btn, texto);
        try {
            return await asyncFn.apply(this, args);
        } finally {
            hideLoading(btn);
        }
    };
}

// export const exPromisse = (algumParametro) => {
//     return new Promise((resolve, reject) => {
//         //.. do some thing
//         resolve('vc me passou: ' + algumParametro);
//     });
// }
// ex call: exPromisse("aas").then(data => { console.log(`data: ${data}`); });

//export function isEmpty(obj) { return Object.keys(obj).length === 0; }
export function addclick(obj, fn) { if (!obj || !fn) { return; } obj.addEventListener("click", function () { fn(); }); }