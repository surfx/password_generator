class DataLocal {

    save(key, obj, base64 = true) {
        if (!key || key.length <= 0) { return false; }
        if (!obj) {
            localStorage[key] = undefined;
            return true;
        }
        localStorage[key] = base64 ? btoa(JSON.stringify(obj)) : JSON.stringify(obj);
        return true;
    }

    load(key, base64 = true) {
        if (!key || key.length <= 0) { return undefined; }
        let rt = localStorage[key];
        if (!rt || rt === undefined || rt === 'undefined') { return undefined; }
        return JSON.parse(base64 ? atob(rt) : rt);
    }

    clear(key) {
        if (!key || key.length <= 0) { return; }
        localStorage[key] = undefined;
        localStorage.removeItem(key);
    }

    // ------------
    // Objects - serialize / deseriliaze
    // ------------
    save_obj(key, obj, converter, base64 = true) {
        if (!key || key.length <= 0 || !converter) { return false; }
        if (!obj) {
            localStorage[key] = undefined;
            return true;
        }
        obj = converter(obj);
        localStorage[key] = base64 ? btoa(obj) : obj;
        return true;
    }

    load_obj(key, converter, base64 = true) {
        if (!key || key.length <= 0 || !converter) { return undefined; }
        let rt = localStorage[key];
        if (!rt || rt === undefined || rt === 'undefined') { return undefined; }
        return converter(base64 ? atob(rt) : rt);
    }

/*
    let token = new Token(7, 'sadf#--d', '2023-01-03 14:25:00')
    let user = new Usuario(3, 'teste', '115--454--154', 'email@gmail.com', '123', false, true, token);

    const key_user = "usuario_logado";
    dtlocal.clear(key_user);
    dtlocal.save_obj(key_user, user, u => u.toJsonSerialize(), true);
    let user2 = dtlocal.load_obj(key_user, Usuario.fromJsonSerialize, true);
    console.log("user2: ", user2);
*/

}