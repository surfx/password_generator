import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from util.Scripto import Criptografia
from util.database import db


def criptografar_dados():
    print("Iniciando criptografia dos dados...")

    cripto = Criptografia()
    data = db.load()

    campos_senhas = ["senha", "login"]
    campos_users = ["senha", "login"]

    usuarios_criptografados = 0
    for user in data.get("users", []):
        original_login = user.get("login", "")
        original_senha = user.get("senha", "")

        user["login"] = cripto.criptografar(user["login"])
        user["senha"] = cripto.criptografar(user["senha"])

        print(f"  Usuário: {original_login[:20]}... -> {user['login'][:20]}...")
        usuarios_criptografados += 1

    senhas_criptografadas = 0
    for senha in data.get("passwords", []):
        original_login = senha.get("login", "")

        senha["login"] = cripto.criptografar(senha["login"])
        senha["senha"] = cripto.criptografar(senha["senha"])

        print(f"  Senha ({original_login[:15]}...): {senha['login'][:20]}...")
        senhas_criptografadas += 1

    db.save(data)

    print(f"\nConcluído!")
    print(f"  Usuários criptografados: {usuarios_criptografados}")
    print(f"  Senhas criptografadas: {senhas_criptografadas}")
    print(f"  Chave de criptografia gerada em: db_json/.key")


def verificar_dados():
    print("\nVerificando dados descriptografados...")

    cripto = Criptografia()
    data = db.load()

    print("  Usuários:")
    for user in data.get("users", [])[:3]:
        login = cripto.descriptografar(user.get("login", ""))
        senha = cripto.descriptografar(user.get("senha", ""))
        print(f"    {login}: {senha}")

    print("  Senhas:")
    for senha in data.get("passwords", [])[:3]:
        login = cripto.descriptografar(senha.get("login", ""))
        print(f"    {login}")


if __name__ == "__main__":
    criptografar_dados()
    verificar_dados()
