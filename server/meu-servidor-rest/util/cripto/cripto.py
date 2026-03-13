import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2


class Criptografia:
    _instance = None
    _fernet = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True

        BASE_DIR = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        key_file = os.path.join(BASE_DIR, "db_json", ".key")

        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                key = f.read()
        else:
            key = Fernet.generate_key()
            os.makedirs(os.path.dirname(key_file), exist_ok=True)
            with open(key_file, "wb") as f:
                f.write(key)

        self._fernet = Fernet(key)

    def criptografar(self, texto: str) -> str:
        if not texto:
            return texto
        return self._fernet.encrypt(texto.encode()).decode()

    def descriptografar(self, texto: str) -> str:
        if not texto:
            return texto
        try:
            return self._fernet.decrypt(texto.encode()).decode()
        except:
            return texto

    def criptografar_campos(self, dados: dict, campos: list) -> dict:
        resultado = dados.copy()
        for campo in campos:
            if campo in resultado and resultado[campo]:
                resultado[campo] = self.criptografar(resultado[campo])
        return resultado

    def descriptografar_campos(self, dados: dict, campos: list) -> dict:
        resultado = dados.copy()
        for campo in campos:
            if campo in resultado and resultado[campo]:
                resultado[campo] = self.descriptografar(resultado[campo])
        return resultado


cripto = Criptografia()
