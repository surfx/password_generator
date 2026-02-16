import sys
import json
import struct
import os
import datetime
import uuid
import base64

# --- Database Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Caminho para db_json/pass_gen_db.json relativo ao script atual
DB_FILE = os.path.join(BASE_DIR, "db_json", "pass_gen_db.json")

def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": [], "passwords": [], "tokens": []}
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data
    except Exception as e:
        return {"users": [], "passwords": [], "tokens": []}

def save_db(data):
    try:
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        pass

# --- Helper Functions ---
def response_ok(data=None, msg="Sucesso", token=None):
    res = {"ok": True, "msg": msg, "data": data}
    if token:
        res["token"] = token
    return res

def response_error(msg="Erro"):
    return {"ok": False, "msg": msg, "data": None}

def get_next_id(collection, id_field="id"):
    if not collection:
        return 1
    ids = [int(item.get(id_field, 0)) for item in collection if str(item.get(id_field, 0)).isdigit()]
    return max(ids) + 1 if ids else 1

def find_user_by_login(db, login, password=None):
    for user in db["users"]:
        if user["login"] == login:
            if password:
                if user["senha"] == password:
                    return user
            else:
                return user
    return None

def validate_token(db, token_str):
    if not token_str:
        return None
    candidates = [token_str]
    try:
        decoded = base64.b64decode(token_str).decode('utf-8')
        candidates.append(decoded)
    except:
        pass

    for candidate in candidates:
        for t in db["tokens"]:
            if t["token"] == candidate:
                if "validade" in t:
                    try:
                        val = datetime.datetime.strptime(t["validade"], "%Y-%m-%d %H:%M:%S")
                        if val < datetime.datetime.now(): 
                            continue 
                    except Exception as e: 
                        continue
                return t
    return None

def create_token(db, user):
    # Remove tokens antigos deste usuário (Política de Sessão Única)
    db["tokens"] = [t for t in db["tokens"] if int(t.get("id_usuario", 0)) != int(user["id_usuario"])]

    token_str = str(uuid.uuid4())
    future_date = datetime.datetime.now() + datetime.timedelta(days=2)
    
    new_token = {
        "id_token": get_next_id(db["tokens"], "id_token"),
        "id_usuario": user["id_usuario"],
        "token": token_str,
        "validade": future_date.strftime("%Y-%m-%d %H:%M:%S")
    }
    db["tokens"].append(new_token)
    save_db(db)
    return new_token

# --- Native Messaging Protocol ---
def read_message():
    try:
        raw_length = sys.stdin.buffer.read(4)
        if len(raw_length) == 0:
            return None
        message_length = struct.unpack('@I', raw_length)[0]
        message = sys.stdin.buffer.read(message_length).decode('utf-8')
        return json.loads(message)
    except Exception as e:
        return None

def send_message(message):
    try:
        encoded_content = json.dumps(message).encode('utf-8')
        encoded_length = struct.pack('@I', len(encoded_content))
        sys.stdout.buffer.write(encoded_length)
        sys.stdout.buffer.write(encoded_content)
        sys.stdout.buffer.flush()
    except Exception as e:
        pass

# --- Message Handler ---
def process_message(msg):
    if not msg:
        return response_error("Mensagem vazia")
    
    action = msg.get("action")
    payload = msg.get("payload", {})
    
    # Token pode vir no payload ou ser authorization
    authorization = payload.get("authorization")

    db = load_db()

    # --- Autenticação ---
    if action == "login":
        login = payload.get("login")
        senha = payload.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            token = create_token(db, user)
            return response_ok(user, "Login realizado", token=token)
        return response_error("Login ou senha inválidos")

    if action == "get_token":
        login = payload.get("login")
        senha = payload.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            token = create_token(db, user)
            return response_ok(token, "Token gerado")
        return response_error("Login ou senha inválidos")

    if action == "logout":
        if authorization:
            token_str_to_remove = authorization
            try:
                token_str_to_remove = base64.b64decode(authorization).decode('utf-8')
            except:
                pass
            initial_len = len(db["tokens"])
            db["tokens"] = [
                t for t in db["tokens"] 
                if t["token"] != authorization and t["token"] != token_str_to_remove
            ]
            if len(db["tokens"]) < initial_len:
                save_db(db)
                return response_ok(None, "Logout realizado com sucesso")
        return response_error("Token inválido para logout")
    
    if action == "tokenvalido":
        token_info = validate_token(db, authorization)
        if not token_info:
            return response_error("Token inválido")
        return response_ok(token_info, "Token válido")

    if action == "tokensinvalidos":
        # Apenas simulação/limpeza, pode não ser necessário retornar nada complexo
        return response_ok(None, "Tokens limpos")

    # --- Usuário ---
    if action == "insert_user":
        nome = payload.get("nome")
        login = payload.get("login")
        senha = payload.get("senha")
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
        token = create_token(db, new_user)
        save_db(db)
        return response_ok(new_user, "Usuário criado", token=token)

    # Validar token para operações protegidas
    token_info = validate_token(db, authorization)
    if not token_info and action not in ["login", "insert_user"]:
        return response_error("Não autorizado")
    
    user_id_from_token = int(token_info["id_usuario"]) if token_info else None

    if action == "list_users":
        return response_ok(db["users"])

    if action == "update_user":
        uid = payload.get("id_usuario")
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                for k, v in payload.items():
                    if k in user and k != "authorization": # Evita sobrescrever com lixo
                        user[k] = v
                save_db(db)
                return response_ok(user, "Atualizado")
        return response_error("Usuário não encontrado")
    
    if action == "update_user_part":
        # Mesma lógica do update_user
        uid = payload.get("id_usuario")
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                # Atualiza apenas campos específicos se presentes
                for field in ["nome", "uuid", "login", "senha"]:
                    if field in payload:
                        user[field] = payload[field]
                save_db(db)
                return response_ok(user, "Atualizado")
        return response_error("Usuário não encontrado")

    if action == "inativar_user":
        uid = payload.get("id_usuario")
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                user["ativo"] = 0
                save_db(db)
                return response_ok(user, "Inativado")
        return response_error("Usuário não encontrado")

    # --- Senhas ---
    if action == "listar_senhas":
        req_uid = user_id_from_token
        dominio_req = payload.get("dominio", "").lower().strip()
        
        result = []
        for pwd in db["passwords"]:
            p_uid = pwd.get("id_usuario")
            if p_uid and int(p_uid) == int(req_uid):
                p_dom = pwd.get("dominio", "").lower()
                if not dominio_req or p_dom == dominio_req:
                    result.append(pwd)
        return response_ok(result)

    if action == "salvar_senha":
        # Usar ID do token para segurança
        uid = user_id_from_token
        dominio = payload.get("dominio", "")
        login = payload.get("login", "")
        senha = payload.get("senha", "")
        
        for pwd in db["passwords"]:
            if (int(pwd["id_usuario"]) == int(uid) and 
               pwd.get("dominio", "").lower() == dominio.lower() and 
               pwd.get("login", "") == login):
                pwd["senha"] = senha
                save_db(db)
                return response_ok(pwd, "Senha atualizada")

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

    if action == "editar_senha":
        id_senha = payload.get("id_senha")
        for pwd in db["passwords"]:
            if int(pwd["id_senha"]) == int(id_senha):
                if int(pwd["id_usuario"]) != int(payload.get("id_usuario")):
                     return response_error("Permissão negada")
                pwd["dominio"] = payload.get("dominio")
                pwd["login"] = payload.get("login")
                pwd["senha"] = payload.get("senha")
                save_db(db)
                return response_ok(pwd, "Senha atualizada")
        return response_error("Senha não encontrada")

    if action == "excluir_senha":
        id_senha = payload.get("id_senha")
        initial_len = len(db["passwords"])
        db["passwords"] = [p for p in db["passwords"] if int(p["id_senha"]) != int(id_senha)]
        if len(db["passwords"]) < initial_len:
            save_db(db)
            return response_ok(None, "Senha excluída")
        return response_error("Senha não encontrada")

    if action == "update_insert_senhas":
        senhas = payload.get("senhas", [])
        if not isinstance(senhas, list):
             return response_error("Esperado lista de senhas")
        
        count_upsert = 0
        for item in senhas:
            dominio = item.get("dominio", "")
            login = item.get("login", "")
            senha = item.get("senha", "")
            updated = False
            for pwd in db["passwords"]:
                 if (int(pwd["id_usuario"]) == int(user_id_from_token) and 
                    pwd.get("dominio", "").lower() == dominio.lower() and 
                    pwd.get("login", "") == login):
                        pwd["senha"] = senha
                        updated = True
                        break
            if not updated:
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
    
    return response_error(f"Ação desconhecida: {action}")

if __name__ == '__main__':
    try:
        while True:
            msg = read_message()
            if msg is None:
                break
            response = process_message(msg)
            send_message(response)
    except Exception as e:
        pass