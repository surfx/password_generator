// (async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     const [{ result }] = await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: () => document.querySelector('a')?.value,
//     });
//     document.getElementById("dados").innerHTML = 'result: ' + result;
// })();


// (async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: inContent1,
//     });
// })();

// // executeScript runs this code inside the tab
// function inContent1() {
//     const el = document.createElement('div');
//     el.style.cssText = 'position:fixed; top:0; left:0; right:0; background:red';
//     el.textContent = 'DIV';
//     document.body.appendChild(el);
// }

import { getUrl } from '../util/util.js';


getUrl(true).then(url => {
    console.log('--6.1: ', url);
});

getUrl(false).then(url => {
    console.log('--6.2: ', url);
});

let tratar = 'https://www.google.com/search?q=javascript+nativo+observable&client=opera-gx&hs=DeI&sca_esv=598932482&ei=JhynZZzGE53C5OUPidij6A0&udm=&ved=0ahUKEwic8Z6qkuODAxUdIbkGHQnsCN0Q4dUDCBA&uact=5&oq=javascript+nativo+observable&gs_lp=Egxnd3Mtd2l6LXNlcnAiHGphdmFzY3JpcHQgbmF0aXZvIG9ic2VydmFibGUyCBAAGAcYHhgTSPEMUNIDWNsLcAF4AZABAJgBmgGgAccGqgEDMC42uAEDyAEA-AEBwgIKEAAYRxjWBBiwA8ICDRAAGIAEGIoFGEMYsAPCAgUQABiABMICBhAAGAcYHsICCBAAGAgYBxge4gMEGAAgQYgGAZAGCg&sclient=gws-wiz-serp';
console.log('tratar: ', tratar);

tratar = tratar.replace('https://', '').replace('http://', '').replace('www.', '');
if (tratar.indexOf('.') >= 0){
    tratar = tratar.substring(0, tratar.indexOf("."));
}


console.log('tratar: ', tratar);

// (async () => {
//     const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//     await chrome.scripting.executeScript({
//         target: { tabId: tab.id },
//         func: () => {

//             // login.microsoft
//             // let loginsFields = document.getElementsByName('loginfmt');
//             // if (!loginsFields){return;}
//             // loginsFields[0].value = 'teste@hotmail.com';

//             // document.getElementsByTagName()
//         }
//     });
// })();
