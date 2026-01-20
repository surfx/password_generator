import sys
import os
import shutil

# Add parent directory to path to import main
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'meu-servidor-rest')))
# Add venv site-packages
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'meu-servidor-rest', '.venv', 'Lib', 'site-packages')))

from fastapi.testclient import TestClient
from main import app, DB_FILE

client = TestClient(app)

def test_token_validation():
    print("Iniciando teste de validação de token...")
    
    # 1. Setup DB (Backup)
    db_backup = DB_FILE + ".bak"
    if os.path.exists(DB_FILE):
        shutil.copy(DB_FILE, db_backup)
    
    try:
        # 2. Register/Login to get token
        login = "test_user_token_check"
        senha = "test_password"
        
        # Try insert
        res = client.post("/userservice/?tipo=insert", json={"nome": "Test Token Check", "login": login, "senha": senha})
        
        token = None
        if res.json()['ok']:
            print("Usuário criado.")
            token = res.json()['token']['token']
        else:
            print("Usuário já existe, tentando login...")
            res = client.post("/userservice/?tipo=login", json={"login": login, "senha": senha})
            if not res.json()['ok']:
                print(f"Falha ao logar/criar: {res.json()}")
                return # Fail
            token = res.json()['token']['token']

        print(f"Token obtido: {token}")

        # 3. Validate Valid Token
        # Note: The backend expects 'authorization' header
        res = client.get("/userservice/?tipo=tokenvalido", headers={"authorization": token})
        print(f"Resultado validação (Esperado OK): {res.json()}")
        
        if not res.json()['ok']:
            raise Exception(f"Token válido rejeitado: {res.json()}")

        # 4. Validate Invalid Token
        fake_token = "invalid-token-12345-xyz"
        res = client.get("/userservice/?tipo=tokenvalido", headers={"authorization": fake_token})
        print(f"Resultado validação inválida (Esperado Erro): {res.json()}")
        
        if res.json()['ok']:
            raise Exception("Token inválido foi aceito!")
        
        if res.json()['msg'] != "Token inválido":
             raise Exception(f"Mensagem de erro inesperada: {res.json()['msg']}")

        print("SUCESSO: Validação de token funcionando conforme esperado.")

    finally:
        # 5. Cleanup (Restore DB)
        if os.path.exists(db_backup):
            # Wait a bit to ensure file handle release if any
            try:
                shutil.move(db_backup, DB_FILE)
            except:
                pass

if __name__ == "__main__":
    test_token_validation()
