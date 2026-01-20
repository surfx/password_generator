import os
import json
import time
import datetime
import uuid
import base64
from typing import Optional, List, Dict, Any, Union
from fastapi import FastAPI, Request, Header, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "db_json", "pass_gen_db.json")

def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": [], "passwords": [], "tokens": []}
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"users": [], "passwords": [], "tokens": []}

def save_db(data):
    os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# --- Helper Functions ---
def response_ok(data: Any = None, msg: str = "Sucesso", token: Any = None):
    res = {"ok": True, "msg": msg, "data": data}
    if token:
        res["token"] = token
    return res

def response_error(msg: str = "Erro"):
    return {"ok": False, "msg": msg, "data": None}

def get_next_id(collection, id_field="id"):
    if not collection:
        return 1
    # Garante que estamos pegando o maior ID numérico
    ids = [int(item.get(id_field, 0)) for item in collection if str(item.get(id_field, 0)).isdigit()]
    return max(ids) + 1 if ids else 1

def find_user_by_login(db, login, password=None):
    for user in db["users"]:
        if user["login"] == login:
            if password:
                # Na prática real, compare hashes. Aqui é simples.
                if user["senha"] == password:
                    return user
            else:
                return user
    return None

def validate_token(db, token_str):
    if not token_str:
        return None
    
    candidates = [token_str]
    # Tenta adicionar versão decodificada de Base64
    try:
        decoded = base64.b64decode(token_str).decode('utf-8')
        candidates.append(decoded)
    except:
        pass

    for candidate in candidates:
        for t in db["tokens"]:
            if t["token"] == candidate:
                # Verifica validade
                if "validade" in t:
                    try:
                        val = datetime.datetime.strptime(t["validade"], "%Y-%m-%d %H:%M:%S")
                        if val < datetime.datetime.now(): 
                            continue # Expirado
                    except: 
                        continue # Data inválida
                return t
    return None

def clean_tokens(db):
    if not db or "tokens" not in db: return
    
    now = datetime.datetime.now()
    valid_tokens = []
    
    # 1. Filtra expirados e formatos antigos
    for t in db["tokens"]:
        if "validade" in t:
            try:
                val = datetime.datetime.strptime(t["validade"], "%Y-%m-%d %H:%M:%S")
                if val > now:
                    valid_tokens.append(t)
            except:
                pass 
    
    # 2. Mantém apenas o mais recente por usuário
    # Ordena por validade desc (mais longe no futuro primeiro)
    valid_tokens.sort(key=lambda x: x["validade"], reverse=True)
    
    unique_tokens = {}
    for t in valid_tokens:
        uid = t["id_usuario"]
        if uid not in unique_tokens:
            unique_tokens[uid] = t
            
    db["tokens"] = list(unique_tokens.values())
    save_db(db)

def create_token(db, user):
    # Remove tokens antigos deste usuário (Política de Sessão Única)
    db["tokens"] = [t for t in db["tokens"] if int(t.get("id_usuario", 0)) != int(user["id_usuario"])]

    token_str = str(uuid.uuid4())
    # Data atual + 1 dia para validade
    future_date = datetime.datetime.now() + datetime.timedelta(days=1)
    
    new_token = {
        "id_token": get_next_id(db["tokens"], "id_token"),
        "id_usuario": user["id_usuario"],
        "token": token_str,
        "validade": future_date.strftime("%Y-%m-%d %H:%M:%S")
    }
    db["tokens"].append(new_token)
    save_db(db)
    return new_token

# --- Rotas ---

@app.post("/authenticacao/")
@app.get("/authenticacao/")
async def authenticacao(
    tipo: str = Query(...),
    body: Dict[str, Any] = Body(default={})
):
    db = load_db()
    
    if tipo == "token":
        login = body.get("login")
        senha = body.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            token = create_token(db, user)
            return response_ok(token, "Token gerado")
        return response_error("Login ou senha inválidos")
        
    elif tipo == "tokensinvalidos":
        # Simula limpeza
        return response_ok(None, "Tokens limpos")
    
    return response_error("Tipo inválido em autenticacao")

@app.post("/userservice/")
@app.get("/userservice/")
async def userservice(
    request: Request,
    tipo: str = Query(...),
    authorization: Optional[str] = Header(None),
    body: Dict[str, Any] = Body(default={})
):
    db = load_db()
    
    # Endpoints que não precisam de auth
    if tipo == "login":
        login = body.get("login")
        senha = body.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            # Gera token no login
            token = create_token(db, user)
            return response_ok(user, "Login realizado", token=token)
        return response_error("Login ou senha inválidos")

    if tipo == "insert":
        nome = body.get("nome")
        login = body.get("login")
        senha = body.get("senha")
        
        if find_user_by_login(db, login):
            return response_error("Usuário já existe")
            
        new_user = {
            "id_usuario": get_next_id(db["users"], "id_usuario"),
            "nome": nome,
            "login": login,
            "senha": senha,
            "uuid": str(uuid.uuid4()),
            "verificado": 1,
            "ativo": 1
        }
        db["users"].append(new_user)
        # Gera token automático no cadastro? O código JS original parece esperar um token no retorno
        token = create_token(db, new_user)
        save_db(db)
        return response_ok(new_user, "Usuário criado", token=token)

    # Endpoints que precisam de auth
    token_info = validate_token(db, authorization)
    if not token_info:
        # Se for validação de token, retorna erro específico ou ok false
        if tipo == "tokenvalido":
             return response_error("Token inválido")
        return response_error("Não autorizado")

    if tipo == "tokenvalido":
        return response_ok(token_info, "Token válido")

    if tipo == "listuser":
        # Retorna todos (cuidado em prod, mas ok pra local)
        return response_ok(db["users"])

    if tipo == "update" or tipo == "update_part":
        uid = body.get("id_usuario")
        if not uid: return response_error("ID obrigatório")
        
        # Acha user e atualiza
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                # Atualiza campos recebidos
                for k, v in body.items():
                    if k in user:
                        user[k] = v
                save_db(db)
                return response_ok(user, "Atualizado")
        return response_error("Usuário não encontrado")

    if tipo == "inativar":
        uid = body.get("id_usuario")
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                user["ativo"] = 0
                save_db(db)
                return response_ok(user, "Inativado")
        return response_error("Usuário não encontrado")

    return response_error("Tipo não implementado em userservice")

@app.post("/senhas/")
@app.get("/senhas/")
async def senhas_service(
    tipo: str = Query(...),
    authorization: Optional[str] = Header(None),
    body: Union[Dict[str, Any], List[Dict[str, Any]]] = Body(default={})
):
    db = load_db()
    
    # Valida Token
    token_info = validate_token(db, authorization)
    if not token_info:
        return response_error("Não autorizado")
    
    user_id_from_token = int(token_info["id_usuario"])

    if tipo == "listar":
        if isinstance(body, list): return response_error("Body inválido")
        req_uid = body.get("id_usuario")
        dominio_req = body.get("dominio", "").lower()
        
        result = []
        for pwd in db["passwords"]:
            # Comparação segura de inteiros
            p_uid = pwd.get("id_usuario")
            if p_uid and int(p_uid) == int(req_uid):
                p_dom = pwd.get("dominio", "").lower()
                # Comparação exata (estrita) conforme solicitado
                if not dominio_req or p_dom == dominio_req:
                    result.append(pwd)
        return response_ok(result)

    if tipo == "salvar":
        if isinstance(body, list): return response_error("Body inválido")
        
        # Segurança: Força o ID do usuário pelo token autenticado
        uid = user_id_from_token
        dominio = body.get("dominio", "")
        login = body.get("login", "")
        senha = body.get("senha", "")
        
        # Upsert: Verifica se já existe
        for pwd in db["passwords"]:
            if int(pwd["id_usuario"]) == int(uid) and \
               pwd.get("dominio", "").lower() == dominio.lower() and \
               pwd.get("login", "") == login:
                
                # Atualiza
                pwd["senha"] = senha
                save_db(db)
                return response_ok(pwd, "Senha atualizada")

        # Insere novo
        new_pwd = {
            "id_senha": get_next_id(db["passwords"], "id_senha"),
            "id_usuario": uid,
            "dominio": dominio,
            "login": login,
            "senha": senha
        }
        db["passwords"].append(new_pwd)
        save_db(db)
        return response_ok(new_pwd, "Senha salva")

    if tipo == "editar":
        if isinstance(body, list): return response_error("Body inválido")
        id_senha = body.get("id_senha")
        for pwd in db["passwords"]:
            if int(pwd["id_senha"]) == int(id_senha):
                if int(pwd["id_usuario"]) != int(body.get("id_usuario")):
                    return response_error("Permissão negada")
                
                pwd["dominio"] = body.get("dominio")
                pwd["login"] = body.get("login")
                pwd["senha"] = body.get("senha")
                save_db(db)
                return response_ok(pwd, "Senha atualizada")
        return response_error("Senha não encontrada")

    if tipo == "excluir":
        if isinstance(body, list): return response_error("Body inválido")
        id_senha = body.get("id_senha")
        initial_len = len(db["passwords"])
        db["passwords"] = [p for p in db["passwords"] if int(p["id_senha"]) != int(id_senha)]
        
        if len(db["passwords"]) < initial_len:
            save_db(db)
            return response_ok(None, "Senha excluída")
        return response_error("Senha não encontrada")
    
    if tipo == "update_insert":
        if not isinstance(body, list):
            return response_error("Esperado lista de senhas")
        
        count_upsert = 0
        for item in body:
            dominio = item.get("dominio", "")
            login = item.get("login", "")
            senha = item.get("senha", "")
            
            updated = False
            # Tenta atualizar existente
            for pwd in db["passwords"]:
                 if int(pwd["id_usuario"]) == int(user_id_from_token) and \
                    pwd.get("dominio", "").lower() == dominio.lower() and \
                    pwd.get("login", "") == login:
                        pwd["senha"] = senha
                        updated = True
                        break
            
            if not updated:
                # Insere novo
                new_pwd = {
                    "id_senha": get_next_id(db["passwords"], "id_senha"),
                    "id_usuario": user_id_from_token,
                    "dominio": dominio,
                    "login": login,
                    "senha": senha
                }
                db["passwords"].append(new_pwd)
            
            count_upsert += 1
            
        save_db(db)
        return response_ok(None, f"{count_upsert} senhas processadas")

    return response_error("Tipo não implementado em senhas")

@app.post("/testes/")
async def testes_service(tipo: str = Query(...)):
    if tipo == "cors":
        return response_ok(None, "CORS OK")
    return response_error("Teste desconhecido")

if __name__ == "__main__":
    # Limpeza inicial
    try:
        clean_tokens(load_db())
    except: pass

    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
