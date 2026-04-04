from __future__ import annotations
import os
from cryptography.fernet import Fernet


class Criptografia:
    _instance: Criptografia | None = None
    _fernet: Fernet | None = None
    _initialized: bool = False

    def __new__(cls) -> Criptografia:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self) -> None:
        if self._initialized:
            return
        self._initialized = True

        base_dir: str = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        )
        key_file: str = os.path.join(base_dir, "db_json", ".key")

        if os.path.exists(key_file):
            with open(key_file, "rb") as f:
                key: bytes = f.read()
        else:
            key = Fernet.generate_key()
            os.makedirs(os.path.dirname(key_file), exist_ok=True)
            with open(key_file, "wb") as f:
                f.write(key)

        self._fernet = Fernet(key)

    def criptografar(self, texto: str) -> str:
        if not texto:
            return texto
        if self._fernet is None:
            raise RuntimeError("Fernet not initialized")
        return self._fernet.encrypt(texto.encode()).decode()

    def descriptografar(self, texto: str) -> str:
        if not texto:
            return texto
        try:
            if self._fernet is None:
                raise RuntimeError("Fernet not initialized")
            return self._fernet.decrypt(texto.encode()).decode()
        except Exception:
            return texto

    def criptografar_campos(self, dados: dict, campos: list[str]) -> dict:
        resultado: dict = dados.copy()
        for campo in campos:
            if campo in resultado and resultado[campo]:
                resultado[campo] = self.criptografar(resultado[campo])
        return resultado

    def descriptografar_campos(self, dados: dict, campos: list[str]) -> dict:
        resultado: dict = dados.copy()
        for campo in campos:
            if campo in resultado and resultado[campo]:
                resultado[campo] = self.descriptografar(resultado[campo])
        return resultado


cripto: Criptografia = Criptografia()
