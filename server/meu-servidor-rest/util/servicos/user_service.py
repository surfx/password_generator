from __future__ import annotations
import uuid
from typing import Any

from util.database import db
from util.logger import logger
from util.response import response_ok, response_error
from util.servicos.token_service import TokenService, get_next_id
from util.cripto.cripto import Criptografia


cripto: Criptografia = Criptografia()


def find_user_by_login(
    login: str, password: str | None = None
) -> dict[str, Any] | None:
    if not login:
        return None

    data: dict[str, Any] = db.load()
    for user in data["users"]:
        if cripto.descriptografar(user.get("login", "")) != login:
            continue
        if password is None:
            return UserService._descriptografar_usuario(user)
        if cripto.descriptografar(user.get("senha", "")) == password:
            return UserService._descriptografar_usuario(user)
    return None


class UserService:
    @staticmethod
    def _criptografar_usuario(user: dict[str, Any]) -> dict[str, Any]:
        return cripto.criptografar_campos(user, ["login", "senha"])

    @staticmethod
    def _descriptografar_usuario(user: dict[str, Any]) -> dict[str, Any]:
        return cripto.descriptografar_campos(user, ["login", "senha"])

    @staticmethod
    def find_by_login(login: str, password: str | None = None) -> dict[str, Any] | None:
        if not login:
            return None

        data: dict[str, Any] = db.load()
        for user in data["users"]:
            if cripto.descriptografar(user.get("login", "")) != login:
                continue
            if password is None:
                return UserService._descriptografar_usuario(user)
            if cripto.descriptografar(user.get("senha", "")) == password:
                return UserService._descriptografar_usuario(user)
        return None

    @staticmethod
    def login(login: str, senha: str) -> dict[str, Any]:
        user = UserService.find_by_login(login, senha)
        if not user:
            return response_error("Login ou senha inválidos")

        token = TokenService.create(user)
        logger.info("Login realizado", f"login: {login}")
        return response_ok(user, "Login realizado", token=token)

    @staticmethod
    def insert(nome: str, login: str, senha: str) -> dict[str, Any]:
        if UserService.find_by_login(login):
            return response_error("Usuário já existe")

        data: dict[str, Any] = db.load()
        new_user: dict[str, Any] = UserService._criptografar_usuario(
            {
                "id_usuario": get_next_id(data["users"], "id_usuario"),
                "nome": nome,
                "login": login,
                "senha": senha,
                "uuid": str(uuid.uuid4()),
                "verificado": 1,
                "ativo": 1,
            }
        )
        data["users"].append(new_user)
        token = TokenService.create(UserService._descriptografar_usuario(new_user))
        db.save(data)

        logger.info("Usuário criado", f"login: {login}")
        return response_ok(
            UserService._descriptografar_usuario(new_user),
            "Usuário criado",
            token=token,
        )

    @staticmethod
    def update(uid: int, fields: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        for user in data["users"]:
            if int(user["id_usuario"]) != int(uid):
                continue
            for k, v in fields.items():
                if k in user:
                    user[k] = v
            db.save(data)
            logger.info("Usuário atualizado", f"id: {uid}")
            return response_ok(UserService._descriptografar_usuario(user), "Atualizado")

        return response_error("Usuário não encontrado")

    @staticmethod
    def inativar(uid: int) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        for user in data["users"]:
            if int(user["id_usuario"]) != int(uid):
                continue
            user["ativo"] = 0
            db.save(data)
            logger.info("Usuário inativado", f"id: {uid}")
            return response_ok(UserService._descriptografar_usuario(user), "Inativado")

        return response_error("Usuário não encontrado")

    @staticmethod
    def list_all() -> dict[str, Any]:
        data: dict[str, Any] = db.load()
        usuarios: list[dict[str, Any]] = [
            UserService._descriptografar_usuario(u) for u in data["users"]
        ]
        return response_ok(usuarios)
