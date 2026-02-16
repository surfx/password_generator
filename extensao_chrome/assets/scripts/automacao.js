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
             } else {
                 executarLoginGenerico(credencial);
             }
        }
    } catch (e) {
        // Ignora erros silenciosamente
        console.error("Erro no login automatico:", e);
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
             } else {
                 executarLoginGenerico(credencial);
             }
        }
    }
});

// ============================================================================
// LÓGICA GENÉRICA DE LOGIN (Heurística)
// ============================================================================
function executarLoginGenerico(credencial) {
    console.log("[AutoLogin] Iniciando tentativa genérica...");

    // Utilitário para disparar eventos (importante para frameworks como React/Angular/Vue)
    const dispararEventos = (elemento) => {
        ['focus', 'input', 'change', 'blur'].forEach(evento => {
            const evt = new Event(evento, { bubbles: true });
            elemento.dispatchEvent(evt);
        });
    };

    const isVisivel = (el) => {
        return el && (el.offsetParent !== null || el.getClientRects().length > 0) && !el.disabled;
    };

    // Heurísticas para encontrar campos
    const encontrarCampoUsuario = () => {
        // 1. Por tipo email (muito comum)
        let el = document.querySelector('input[type="email"]:not([type="hidden"])');
        if (isVisivel(el)) return el;

        // 2. Por nome/id/placeholder com palavras chave
        const seletores = [
            'input[name*="user" i]', 'input[id*="user" i]',
            'input[name*="login" i]', 'input[id*="login" i]',
            'input[name*="email" i]', 'input[id*="email" i]',
            'input[name*="cpf" i]', 'input[id*="cpf" i]',
            'input[name*="cnpj" i]', 'input[id*="cnpj" i]',
            'input[placeholder*="email" i]', 'input[placeholder*="usuário" i]',
            'input[placeholder*="login" i]', 'input[placeholder*="cpf" i]'
        ];
        
        for (let sel of seletores) {
            el = document.querySelector(sel);
            if (isVisivel(el) && el.type !== 'password') return el;
        }
        
        // 3. Fallback: Primeiro input text visível (arriscado, usar com cautela ou remover)
        // el = document.querySelector('input[type="text"]');
        // if (isVisivel(el)) return el;
        
        return null;
    };

    const encontrarCampoSenha = () => {
        const el = document.querySelector('input[type="password"]:not([type="hidden"])');
        return isVisivel(el) ? el : null;
    };

    const encontrarBotaoAcao = (isLoginFinal = false) => {
        // Seleciona botões e inputs de submit
        const elementos = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a[role="button"], div[role="button"]'));
        
        // Palavras-chave
        const termosLogin = ['entrar', 'login', 'sign in', 'acessar', 'logar', 'conectar', 'autenticar'];
        const termosProximo = ['próximo', 'next', 'avançar', 'continuar', 'continue', 'seguinte'];
        
        // Se for login final, prioriza termos de login, mas aceita "próximo" se não achar nada melhor
        const termos = isLoginFinal ? [...termosLogin, ...termosProximo] : [...termosLogin, ...termosProximo];

        return elementos.find(el => {
            if (!isVisivel(el)) return false;
            const texto = (el.innerText || el.value || el.getAttribute('aria-label') || "").toLowerCase();
            return termos.some(termo => texto.includes(termo));
        });
    };

    const encontrarGatilhoLogin = () => {
        // Tenta encontrar botões que abrem modais de login (ex: "Entre ou Cadastre-se", "Login", "Minha Conta")
        const seletores = [
            'a[href*="login"]', 'a[href*="signin"]', 'a[href*="entrar"]',
            'button[class*="login"]', 'div[class*="login"]',
            'a[class*="login"]'
        ];
        
        // 1. Busca por seletores específicos
        for (let sel of seletores) {
            const els = document.querySelectorAll(sel);
            for (let el of els) {
                if (isVisivel(el)) return el;
            }
        }

        // 2. Busca por texto (mais custoso, mas abrangente)
        const elementos = Array.from(document.querySelectorAll('a, button, div[role="button"], span[role="button"]'));
        const termosGatilho = ['entre', 'entrar', 'fazer login', 'login', 'minha conta', 'acessar conta'];
        
        return elementos.find(el => {
            if (!isVisivel(el)) return false;
            const texto = (el.innerText || el.getAttribute('title') || "").toLowerCase().trim();
            // Evita botões muito longos que provavelmente são textos explicativos
            if (texto.length > 30) return false;
            return termosGatilho.some(termo => texto.includes(termo));
        });
    };

    let gatilhoClicado = false;

    // Função executada ciclicamente
    const tentarPreencher = () => {
        const campoUser = encontrarCampoUsuario();
        const campoPass = encontrarCampoSenha();
        
        // Cenário 0: Nada encontrado -> Tentar abrir modal de login
        if (!campoUser && !campoPass) {
            if (!gatilhoClicado) {
                const gatilho = encontrarGatilhoLogin();
                if (gatilho) {
                    console.log("[AutoLogin] Possível botão de login encontrado. Clicando...", gatilho);
                    gatilho.click();
                    gatilhoClicado = true;
                    return false; // Retorna false para esperar o modal abrir no próximo ciclo
                }
            }
            return false;
        }

        // Cenário 1: Usuário e Senha visíveis (Login Padrão)
        if (campoUser && campoPass) {
            let acaoRealizada = false;
            
            if (campoUser.value !== credencial.login) {
                campoUser.value = credencial.login;
                dispararEventos(campoUser);
                acaoRealizada = true;
            }
            
            if (campoPass.value !== credencial.senha) {
                campoPass.value = credencial.senha;
                dispararEventos(campoPass);
                acaoRealizada = true;
            }

            // Se preencheu algo ou já estava preenchido, tenta submeter
            const btn = encontrarBotaoAcao(true); 
            if (btn && acaoRealizada) {
                setTimeout(() => {
                    console.log("[AutoLogin] Clicando em entrar...");
                    btn.click();
                    // Assume sucesso e limpa para não ficar tentando eternamente
                    chrome.storage.local.remove("login_automatico");
                }, 500);
            }
            return true; // Encontrou ambos
        }
        
        // Cenário 2: Apenas Usuário visível (Login em Etapas)
        if (campoUser && !campoPass) {
            if (campoUser.value !== credencial.login) {
                campoUser.value = credencial.login;
                dispararEventos(campoUser);
                
                // Clica em "Próximo" para revelar a senha
                setTimeout(() => {
                    const btn = encontrarBotaoAcao(false);
                    if (btn) {
                        console.log("[AutoLogin] Clicando em próximo...");
                        btn.click();
                    }
                }, 500);
            } else {
                 // Usuário já preenchido, talvez precise clicar em próximo de novo se a senha não apareceu
                 const btn = encontrarBotaoAcao(false);
                 if (btn) {
                     // Verifica se o botão não é o de "criar conta" para evitar falsos positivos
                     const texto = (btn.innerText || "").toLowerCase();
                     if (!texto.includes("criar") && !texto.includes("cadastrar")) {
                        // Só clica se não houver um input de senha carregando
                        setTimeout(() => btn.click(), 500);
                     }
                 }
            }
            return false; // Retorna false para continuar o loop esperando a senha aparecer
        }

        // Cenário 3: Apenas Senha visível (Usuário já lembrado pelo site)
        if (!campoUser && campoPass) {
             if (campoPass.value !== credencial.senha) {
                campoPass.value = credencial.senha;
                dispararEventos(campoPass);
                
                setTimeout(() => {
                    const btn = encontrarBotaoAcao(true);
                    if (btn) {
                        console.log("[AutoLogin] Clicando em entrar (apenas senha)...");
                        btn.click();
                        chrome.storage.local.remove("login_automatico");
                    }
                }, 500);
                return true;
            }
        }
        
        return false;
    };

    // Loop de tentativas com MutationObserver e setInterval
    // O setInterval garante que tentamos mesmo se o DOM não mudar (ex: campos que aparecem com delay CSS)
    let tentativas = 0;
    const maxTentativas = 40; // ~20 segundos tentando

    const intervalo = setInterval(() => {
        const achouAmbos = tentarPreencher();
        tentativas++;
        
        if (achouAmbos || tentativas > maxTentativas) {
            // Se achou ambos, ainda espera um pouco antes de matar o intervalo para garantir o clique
            if (tentativas > maxTentativas) clearInterval(intervalo);
        }
    }, 500);
}

// ============================================================================
// LÓGICAS ESPECÍFICAS
// ============================================================================

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