// Script injetado para automação de login
// Este script roda no contexto da página web

// Mapeamento de domínios específicos para lógicas customizadas
const LOGICAS_CUSTOMIZADAS = {
    "seguranca.des.sinesp.serpro": executarLoginSinesp,
    "seguranca.val.sinesp.serpro": executarLoginSinesp,
    "seguranca.tst.sinesp.serpro": executarLoginSinesp
};

// Verifica se há login pendente ao carregar a página (Recuperação pós-refresh)
async function verificarLoginPendente() {
    try {
        const data = await chrome.storage.local.get("login_automatico");
        const credencial = data.login_automatico;
        
        if (!credencial) return;

        // Verifica validade (ex: 2 minutos de tolerância para o login completar)
        const agora = new Date().getTime();
        const timestamp = credencial._timestamp || 0;
        
        if (agora - timestamp > 120000) { 
            return; // Solicitação expirada
        }

        let url = window.location.hostname;
        if (url.startsWith('www.')) url = url.substring(4);

        if (credencial.dominio && url.toLowerCase() === credencial.dominio.toLowerCase()) {
             const logicaParaExecutar = LOGICAS_CUSTOMIZADAS[url];
             if (logicaParaExecutar) {
                 logicaParaExecutar(credencial);
             }
        }
    } catch (e) {
        console.error("[AutoLogin] Erro ao verificar pendencia", e);
    }
}

// Inicializa verificação ao carregar a página
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", verificarLoginPendente);
} else {
    verificarLoginPendente();
}

// Escuta novas solicitações vindas do popup
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.login_automatico) {
        const credencial = changes.login_automatico.newValue;
        if (!credencial) return;
        
        let url = window.location.hostname;
        if (url.startsWith('www.')) url = url.substring(4);
        
        if (credencial.dominio && url.toLowerCase() === credencial.dominio.toLowerCase()) {
             const logicaParaExecutar = LOGICAS_CUSTOMIZADAS[url];
             if (logicaParaExecutar) {
                 logicaParaExecutar(credencial);
             }
        }
    }
});

// Lógica específica para SINESP / Serpro
function executarLoginSinesp(credencial) {
    const ID_CPF = "formLogin:identificacao";
    const ID_SENHA = "formLogin:senha";
    const ID_BTN = "formLogin:btnEntrar";

    const preencher = (el, valor) => {
        if (!el || el.value === valor) return false; 
        el.value = valor;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        return true;
    };

    const tentarInteracao = () => {
        const elCpf = document.getElementById(ID_CPF);
        const elSenha = document.getElementById(ID_SENHA);
        const btn = document.getElementById(ID_BTN);
        const senhaVisivel = elSenha && elSenha.offsetParent !== null && !elSenha.disabled;

        // Prioridade: Tela de Senha
        if (senhaVisivel) {
            if (elSenha.value !== credencial.senha) {
                if (preencher(elSenha, credencial.senha)) {
                    setTimeout(() => { 
                        if (btn) btn.click(); 
                        // Limpa a automação para evitar loops ao deslogar
                        chrome.storage.local.remove("login_automatico");
                    }, 500);
                }
            }
            return; 
        }

        // Tela de CPF
        if (elCpf && btn) {
            if (elCpf.value !== credencial.login) {
                if (preencher(elCpf, credencial.login)) {
                    setTimeout(() => { if (btn) btn.click(); }, 500);
                }
            } else {
                // CPF preenchido, mas senha não visível -> Clica para avançar
                if (btn.offsetParent !== null && !btn.disabled) {
                     setTimeout(() => { if (btn) btn.click(); }, 300);
                }
            }
        }
    };

    let tentativas = 0;
    const intervalo = setInterval(() => {
        tentarInteracao();
        tentativas++;
        if (tentativas > 90) clearInterval(intervalo); 
    }, 1000);

    const observer = new MutationObserver((mutations) => {
        tentarInteracao();
    });
    
    const formTarget = document.getElementById("formLogin") || document.body;
    if (formTarget) {
        observer.observe(formTarget, { childList: true, subtree: true });
    }
}
