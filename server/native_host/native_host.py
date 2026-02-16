import sys
import json
import struct
import os
import datetime
import uuid
import base64
import traceback
from pathlib import Path

# --- Configurações de Encoding ---
if sys.platform == "win32":
    import msvcrt
    msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

# --- Database Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "db_json", "pass_gen_db.json")
LOG_FILE = os.path.join(BASE_DIR, "native_host_debug.log")
BAT_LOG_FILE = os.path.join(BASE_DIR, "native_host.log")

LOG_RETENTION_DAYS = 1

def limpar_logs_antigos():
    """Remove logs com mais de LOG_RETENTION_DAYS dias"""
    try:
        agora = datetime.datetime.now()
        
        for log_path in [LOG_FILE, BAT_LOG_FILE]:
            if not os.path.exists(log_path):
                continue
            
            # Verifica a data de modificação do arquivo
            modificacao = datetime.datetime.fromtimestamp(os.path.getmtime(log_path))
            idade_dias = (agora - modificacao).days
            
            if idade_dias >= LOG_RETENTION_DAYS:
                # Cria backup antes de limpar
                backup_path = f"{log_path}.backup"
                if os.path.exists(backup_path):
                    os.remove(backup_path)
                os.rename(log_path, backup_path)
                
                # Cria novo arquivo vazio
                with open(log_path, "w", encoding="utf-8") as f:
                    f.write(f"[{agora.strftime('%Y-%m-%d %H:%M:%S')}] Log rotacionado (idade: {idade_dias} dias)\n")
                
                log_debug(f"Log rotacionado: {os.path.basename(log_path)} (idade: {idade_dias} dias)")
    except Exception as e:
        # Não interrompe a execução se houver erro na limpeza
        pass

def log_debug(message):
    """Registra mensagens de debug"""
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            f.write(f"[{timestamp}] {message}\n")
            f.flush()
    except:
        pass

def load_db():
    try:
        if not os.path.exists(DB_FILE):
            log_debug("DB não encontrado, criando estrutura vazia")
            initial_db = {"users": [], "passwords": [], "tokens": []}
            save_db(initial_db)
            return initial_db
        with open(DB_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            log_debug(f"DB carregado: {len(data.get('users', []))} usuários, {len(data.get('passwords', []))} senhas")
            return data
    except Exception as e:
        log_debug(f"ERRO ao carregar DB: {str(e)}")
        return {"users": [], "passwords": [], "tokens": []}

def save_db(data):
    try:
        os.makedirs(os.path.dirname(DB_FILE), exist_ok=True)
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        log_debug("DB salvo com sucesso")
    except Exception as e:
        log_debug(f"ERRO ao salvar DB: {str(e)}")

def read_message():
    """Lê mensagem do Chrome via stdin (protocolo Native Messaging)"""
    try:
        # Lê 4 bytes do tamanho da mensagem
        raw_length = sys.stdin.buffer.read(4)
        
        if len(raw_length) == 0:
            log_debug("stdin fechado (EOF), encerrando...")
            return None
        
        if len(raw_length) != 4:
            log_debug(f"ERRO: Esperava 4 bytes, recebeu {len(raw_length)}")
            return None
        
        message_length = struct.unpack('@I', raw_length)[0]
        log_debug(f"Tamanho da mensagem: {message_length} bytes")
        
        if message_length > 1024 * 1024:  # Limite de 1MB
            log_debug(f"ERRO: Mensagem muito grande ({message_length} bytes)")
            return None
        
        # Lê a mensagem JSON
        message_bytes = sys.stdin.buffer.read(message_length)
        
        if len(message_bytes) != message_length:
            log_debug(f"ERRO: Esperava {message_length} bytes, recebeu {len(message_bytes)}")
            return None
        
        message = message_bytes.decode('utf-8')
        log_debug(f"Mensagem bruta: {message[:200]}...")  # Primeiros 200 chars
        
        return json.loads(message)
    
    except json.JSONDecodeError as e:
        log_debug(f"ERRO JSON: {str(e)}")
        return None
    except Exception as e:
        log_debug(f"ERRO ao ler mensagem: {str(e)}\n{traceback.format_exc()}")
        return None

def send_message(message):
    """Envia mensagem para o Chrome via stdout"""
    try:
        encoded_content = json.dumps(message, ensure_ascii=False).encode('utf-8')
        encoded_length = struct.pack('@I', len(encoded_content))
        
        sys.stdout.buffer.write(encoded_length)
        sys.stdout.buffer.write(encoded_content)
        sys.stdout.buffer.flush()
        
        log_debug(f"Resposta enviada: {str(message)[:200]}...")
    except Exception as e:
        log_debug(f"ERRO ao enviar mensagem: {str(e)}\n{traceback.format_exc()}")

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
            if password is None or user["senha"] == password:
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
                    except:
                        continue
                return t
    return None

def create_token(db, user):
    # Remove tokens antigos deste usuário
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

def process_message(msg):
    """Processa mensagem recebida do Chrome"""
    if not msg:
        return response_error("Mensagem vazia")

    action = msg.get("action")
    payload = msg.get("payload", {})
    authorization = payload.get("authorization")

    log_debug(f"Ação: {action}, Payload: {str(payload)[:100]}...")

    db = load_db()

    # --- LOGIN ---
    if action == "login":
        login = payload.get("login")
        senha = payload.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            token = create_token(db, user)
            log_debug(f"Login bem-sucedido: {login}")
            return response_ok(user, "Login realizado", token=token)
        log_debug(f"Login falhou: {login}")
        return response_error("Login ou senha inválidos")

    # --- GET TOKEN ---
    if action == "get_token":
        login = payload.get("login")
        senha = payload.get("senha")
        user = find_user_by_login(db, login, senha)
        if user:
            token = create_token(db, user)
            return response_ok(token, "Token gerado")
        return response_error("Login ou senha inválidos")

    # --- LOGOUT ---
    if action == "logout":
        if authorization:
            token_str_to_remove = authorization
            try:
                token_str_to_remove = base64.b64decode(authorization).decode('utf-8')
            except:
                pass
            initial_len = len(db["tokens"])
            db["tokens"] = [t for t in db["tokens"] if t["token"] not in [authorization, token_str_to_remove]]
            if len(db["tokens"]) < initial_len:
                save_db(db)
                return response_ok(None, "Logout realizado")
        return response_error("Token inválido")

    # --- TOKEN VÁLIDO ---
    if action == "tokenvalido":
        token_info = validate_token(db, authorization)
        if token_info:
            return response_ok(token_info, "Token válido")
        return response_error("Token inválido")

    # --- LIMPAR TOKENS ---
    if action == "tokensinvalidos":
        now = datetime.datetime.now()
        initial_len = len(db["tokens"])
        db["tokens"] = [t for t in db["tokens"] if datetime.datetime.strptime(t["validade"], "%Y-%m-%d %H:%M:%S") > now]
        removed = initial_len - len(db["tokens"])
        if removed > 0:
            save_db(db)
        return response_ok(None, f"{removed} tokens removidos")

    # --- INSERIR USUÁRIO ---
    if action == "insert_user":
        nome = payload.get("nome")
        login = payload.get("login")
        senha = payload.get("senha")
        
        # ✅ Valida campos obrigatórios
        if not nome or not login or not senha:
            return response_error("Nome, login e senha são obrigatórios")
        
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

    # === OPERAÇÕES PROTEGIDAS (requerem token) ===
    token_info = validate_token(db, authorization)
    if not token_info:
        return response_error("Não autorizado")

    user_id_from_token = int(token_info["id_usuario"])

    # --- LISTAR USUÁRIOS ---
    if action == "list_users":
        return response_ok(db["users"])

    # ATUALIZAR USUÁRIO
    if action in ["update_user", "update_user_part"]:
        log_debug(f"Payload completo recebido: {payload}")  # DEBUG
        
        uid = payload.get("id_usuario")
        nome = payload.get("nome")
        login_new = payload.get("login")
        senha_new = payload.get("senha")
        
        log_debug(f"Campos recebidos - id: {uid}, nome: {nome}, login: {login_new}, senha: {'***' if senha_new else None}")
        
        # Se não vier id_usuario, usa o do token
        if uid is None:
            uid = user_id_from_token
            log_debug(f"Usando id_usuario do token: {uid}")
        
        user_found = None
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                user_found = user
                break
        
        if not user_found:
            log_debug(f"Usuário {uid} não encontrado")
            return response_error("Usuário não encontrado")
        
        # Verifica permissão
        if int(uid) != user_id_from_token:
            log_debug(f"Sem permissão: {uid} != {user_id_from_token}")
            return response_error("Permissão negada")
        
        # Atualiza campos
        updated_fields = []
        
        if nome and nome != user_found.get("nome"):
            user_found["nome"] = nome
            updated_fields.append("nome")
        
        if login_new and login_new != user_found.get("login"):
            user_found["login"] = login_new
            updated_fields.append("login")
        
        if senha_new and senha_new != user_found.get("senha"):
            user_found["senha"] = senha_new
            updated_fields.append("senha")
        
        if updated_fields:
            save_db(db)
            log_debug(f"Usuário {uid} atualizado: {', '.join(updated_fields)}")
        else:
            log_debug(f"Nenhum campo foi alterado para usuário {uid}")
        
        return response_ok(user_found, "Usuário atualizado")

    # --- INATIVAR USUÁRIO ---
    if action == "inativar_user":
        uid = payload.get("id_usuario")
        for user in db["users"]:
            if int(user["id_usuario"]) == int(uid):
                user["ativo"] = 0
                save_db(db)
                return response_ok(user, "Usuário inativado")
        return response_error("Usuário não encontrado")

    # --- LISTAR SENHAS ---
    if action == "listar_senhas":
        dominio_req = payload.get("dominio", "").lower().strip()
        result = [pwd for pwd in db["passwords"] 
                  if int(pwd.get("id_usuario", 0)) == user_id_from_token 
                  and (not dominio_req or pwd.get("dominio", "").lower() == dominio_req)]
        return response_ok(result)

    # --- SALVAR SENHA ---
    if action == "salvar_senha":
        dominio = payload.get("dominio", "").strip()
        login = payload.get("login", "").strip()
        senha = payload.get("senha", "")
        
        # ✅ Valida campos obrigatórios
        if not dominio or not login or not senha:
            return response_error("Domínio, login e senha são obrigatórios")
        
        # Atualiza se já existe
        for pwd in db["passwords"]:
            if (int(pwd["id_usuario"]) == user_id_from_token and 
                pwd.get("dominio", "").lower() == dominio.lower() and 
                pwd.get("login", "") == login):
                pwd["senha"] = senha
                save_db(db)
                return response_ok(pwd, "Senha atualizada")
        
        # Cria nova
        new_pwd = {
            "id_senha": get_next_id(db["passwords"], "id_senha"),
            "id_usuario": user_id_from_token,
            "dominio": dominio,
            "login": login,
            "senha": senha
        }
        db["passwords"].append(new_pwd)
        save_db(db)
        return response_ok(new_pwd, "Senha salva")

    # --- EDITAR SENHA ---
    if action == "editar_senha":
        id_senha = payload.get("id_senha")
        
        if not id_senha:
            return response_error("id_senha é obrigatório")
        
        for pwd in db["passwords"]:
            if int(pwd["id_senha"]) == int(id_senha):
                if int(pwd["id_usuario"]) != user_id_from_token:
                    return response_error("Permissão negada")
                
                # ✅ Atualiza apenas campos fornecidos
                if "dominio" in payload and payload["dominio"]:
                    pwd["dominio"] = payload["dominio"]
                if "login" in payload and payload["login"]:
                    pwd["login"] = payload["login"]
                if "senha" in payload and payload["senha"]:
                    pwd["senha"] = payload["senha"]
                
                save_db(db)
                return response_ok(pwd, "Senha editada")
        
        return response_error("Senha não encontrada")

    # --- EXCLUIR SENHA ---
    if action == "excluir_senha":
        id_senha = payload.get("id_senha")
        
        if not id_senha:
            return response_error("id_senha é obrigatório")
        
        # ✅ Verifica permissão antes de excluir
        senha_encontrada = None
        for pwd in db["passwords"]:
            if int(pwd["id_senha"]) == int(id_senha):
                senha_encontrada = pwd
                break
        
        if not senha_encontrada:
            return response_error("Senha não encontrada")
        
        if int(senha_encontrada["id_usuario"]) != user_id_from_token:
            return response_error("Permissão negada")
        
        # Remove
        db["passwords"] = [p for p in db["passwords"] if int(p["id_senha"]) != int(id_senha)]
        save_db(db)
        log_debug(f"Senha {id_senha} excluída pelo usuário {user_id_from_token}")
        return response_ok(None, "Senha excluída")

    # --- UPDATE/INSERT MÚLTIPLAS SENHAS ---
    if action == "update_insert_senhas":
        senhas = payload.get("senhas", [])
        
        if not isinstance(senhas, list):
            return response_error("Esperado lista de senhas")
        
        count = 0
        for item in senhas:
            dominio = item.get("dominio", "").strip()
            login = item.get("login", "").strip()
            senha = item.get("senha", "")
            
            # ✅ Pula itens inválidos
            if not dominio or not login or not senha:
                continue
            
            updated = False
            for pwd in db["passwords"]:
                if (int(pwd["id_usuario"]) == user_id_from_token and 
                    pwd.get("dominio", "").lower() == dominio.lower() and 
                    pwd.get("login", "") == login):
                    pwd["senha"] = senha
                    updated = True
                    break
            
            if not updated:
                db["passwords"].append({
                    "id_senha": get_next_id(db["passwords"], "id_senha"),
                    "id_usuario": user_id_from_token,
                    "dominio": dominio,
                    "login": login,
                    "senha": senha
                })
            count += 1
        
        save_db(db)
        return response_ok(None, f"{count} senhas processadas")

    return response_error(f"Ação desconhecida: {action}")

# === MAIN LOOP ===
if __name__ == '__main__':
    limpar_logs_antigos()

    log_debug("========== HOST NATIVO INICIADO ==========")
    try:
        while True:
            msg = read_message()
            
            if msg is None:
                log_debug("Mensagem nula recebida, encerrando loop")
                break
            
            response = process_message(msg)
            send_message(response)
    
    except KeyboardInterrupt:
        log_debug("Interrompido pelo usuário (Ctrl+C)")
    except Exception as e:
        log_debug(f"ERRO FATAL: {str(e)}\n{traceback.format_exc()}")
        send_message({"ok": False, "msg": f"Erro interno: {str(e)}"})
    finally:
        log_debug("========== HOST NATIVO ENCERRADO ==========")