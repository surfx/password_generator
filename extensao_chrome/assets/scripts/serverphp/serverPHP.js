class ServerPHP {

    #privado() { }

    async doLogin(login, senha) {

        const res = await fetch("http://192.168.0.4/helloworld/code/service/userservice/?tipo=login", {
            method: "POST",
            body: JSON.stringify({
                login: login,
                senha: senha
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        });

        const json = await res.json();
        console.log(json);
    }


    async fetchDataUK() {
        const res = await fetch("https://api.coronavirus.data.gov.uk/v1/data", {
            method: "GET",
            headers: {
                "Authorization": "MWFhM2UzOGViMTU4NTM4OTkxOWU5MmEyYTU4NGQ0ZWU="
            }
        });
        const record = await res.json();
        console.log(record);
    }

    async listUsers() {
        const res = await fetch("http://192.168.0.4/helloworld/code/service/userservice/?tipo=listuser", {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Access-Control-Allow-Origin': 'no-cors',
                'Access-Control-Allow-Headers': 'Content-Type',
                "Authorization": "MWFhM2UzOGViMTU4NTM4OTkxOWU5MmEyYTU4NGQ0ZWU="
            }
        });
        const record = await res.json();
        console.log(record);
    }

    async testescors() {
        const res = await fetch("http://192.168.0.4/helloworld/code/service/testes/?tipo=cors", {
            method: "POST"
        });
        const record = await res.json();
        console.log(record);
    }


}