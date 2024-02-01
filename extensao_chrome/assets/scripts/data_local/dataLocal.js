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

    // ---- em se tratando de objetos é preciso serializar e deserializar os mesmos
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
        if (!key || key.length <= 0) { return undefined; }
        let rt = localStorage[key];
        if (!rt || rt === undefined || rt === 'undefined') { return undefined; }
        return converter(base64 ? atob(rt) : rt);
    }



}