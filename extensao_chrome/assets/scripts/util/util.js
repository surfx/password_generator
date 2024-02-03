export const getUrl = (urlCompleta) => {
    return new Promise((resolve, reject) => {

        if (!chrome || !chrome.tabs || !chrome.tabs.query) {
            resolve('TESTE');
            return;
        }

        chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
            let url = tabs[0].url;
            if (!urlCompleta) {
                url = url.replace('https://', '').replace('http://', '').replace('www.', '');
                if (url.indexOf('.') >= 0) {
                    url = url.substring(0, url.indexOf("."));
                }
            }
            resolve(url);
        });
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
    }, 1000);
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