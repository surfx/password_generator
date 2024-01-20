//-------------------
// Local Data Browser
//-------------------
// salvar 1 usuário e 1 senha { usuario: ..., senha: ..., dominio: ... }
export function saveDataSenhas(data) {
    if (!data || !data.usuario || !data.senha || !data.dominio) { return; }

    let dataSenhas = recuperarDataSenhas();
    if (!dataSenhas) { dataSenhas = []; }

    //console.log('dataSenhas: ', dataSenhas, dataSenhas.length, typeof dataSenhas);

    if (dataSenhas.length <= 0) {
        dataSenhas.push(data);
        localStorage["dataSenhas"] = btoa(JSON.stringify(dataSenhas));
        return;
    }

    let auxDataSenhas = dataSenhas.filter(
        item => {
            return !!item && !!item.dominio && !!item.usuario &&
                item.dominio.toLowerCase().trim() === data.dominio.toLowerCase().trim() &&
                item.usuario.toLowerCase().trim() === data.usuario.toLowerCase().trim()
        }
    );

    // sem o usuário para esse domínio
    if (!!auxDataSenhas && auxDataSenhas.length <= 0) {
        dataSenhas.push(data);
        localStorage["dataSenhas"] = btoa(JSON.stringify(dataSenhas));
        return;
    }

    // atualizar a senha e salvar a base
    for (let i = 0; i < dataSenhas.length; i++) {
        let auxItem = dataSenhas[i];
        if (!auxItem || !auxItem.usuario || !auxItem.dominio) { continue; }
        if (auxItem.dominio.toLowerCase().trim() !== data.dominio.toLowerCase().trim()) { continue; }
        if (auxItem.usuario.toLowerCase().trim() !== data.usuario.toLowerCase().trim()) { continue; }

        auxItem.senha = data.senha;
        dataSenhas[i] = auxItem;
        break;
    }

    localStorage["dataSenhas"] = btoa(JSON.stringify(dataSenhas));
}

export function recuperarDataSenhasDominio(dominio, filtroUsuario) {
    if (!dominio) { return []; }
    dominio = dominio.toLowerCase().trim();
    if (!dominio || dominio.length <= 0) { return []; }
    let dataSenhas = recuperarDataSenhas();
    if (!dataSenhas) { return []; }

    let rt = dataSenhas.filter(
        item => {
            return !!item && !!item.dominio && item.dominio.toLowerCase().trim() === dominio
        }
    );

    if (!!filtroUsuario && filtroUsuario.length > 0) {
        filtroUsuario = filtroUsuario.toLowerCase().trim();

        rt = rt.filter(
            item => {
                return !!item && !!item.usuario && item.usuario.toLowerCase().trim().indexOf(filtroUsuario) >= 0
            }
        );
    }

    return rt;
}

export function recuperarDataSenhas() {
    let rt = localStorage["dataSenhas"];
    if (!rt) { return undefined; }
    try {
        return JSON.parse(atob(rt));
    } catch (error) {
        localStorage.removeItem("dataSenhas");
        return undefined;
    }
}


export function excluirSenha(dominio, usuario) {
    if (!dominio || !usuario) { return false; }
    dominio = dominio.toLowerCase().trim();
    usuario = usuario.toLowerCase().trim();
    if (!dominio || dominio.length <= 0 || !usuario || usuario.length <= 0) { return false; }
    let dataSenhas = recuperarDataSenhas();
    if (!dataSenhas || dataSenhas.length <= 0) { return false; }

    let indexRemover = dataSenhas.findIndex(item =>
        !!item && !!item.dominio && item.dominio.toLowerCase().trim() === dominio &&
        !!item.usuario && item.usuario.toLowerCase().trim() === usuario
    );
    if (indexRemover < 0) { return false; }
    dataSenhas.splice(indexRemover, 1);
    localStorage["dataSenhas"] = btoa(JSON.stringify(dataSenhas));
    return true;
}