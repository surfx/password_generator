import urllib.request
import json

print("------------------------------------------")
print("Obs: Precisa atualiza o token de acordo com o arquivo 'pass_gen_db.json'")
print("------------------------------------------")

url = "http://127.0.0.1:8000/senhas/?tipo=listar"
token = "9db9b251-56cd-419f-8a6a-1298469b5614" # Token que está no pass_gen_db.json
payload = {
    "id_usuario": 1,
    "dominio": "seguranca.des.sinesp.serpro"
}

req = urllib.request.Request(url)
req.add_header('Content-Type', 'application/json; charset=utf-8')
req.add_header('Authorization', token)

jsondata = json.dumps(payload).encode('utf-8')
req.add_header('Content-Length', len(jsondata))

try:
    response = urllib.request.urlopen(req, jsondata)
    data = json.load(response)
    print("Status:", response.getcode())
    print("Response:", json.dumps(data, indent=2))
except Exception as e:
    print("Erro:", e)
