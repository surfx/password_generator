from __future__ import annotations
from typing import Any

from util.database import db
from util.logger import logger
from util.response import response_ok, response_error
from util.servicos.token_service import get_next_id
from util.cripto.cripto import Criptografia


cripto: Criptografia = Criptografia()


class PasswordService:
    @staticmethod
    def _descriptografar_senha(pwd: dict[str, Any]) -> dict[str, Any]:
        return cripto.descriptografar_campos(pwd, ["login", "senha"])

    @staticmethod
    def _criptografar_senha(pwd: dict[str, Any]) -> dict[str, Any]:
        return cripto.criptografar_campos(pwd, ["login", "senha"])

    @staticmethod
    def listar(user_id: int, dominio: str = "") -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        result: list[dict[str, Any]] = [
            PasswordService._descriptografar_senha(p)
            for p in data["passwords"]
            if int(p.get("id_usuario", 0)) == int(user_id)
            and (not dominio or p.get("dominio", "").lower() == dominio.lower())
        ]
        return response_ok(result)

    @staticmethod
    def salvar(user_id: int, dominio: str, login: str, senha: str) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        for pwd in data["passwords"]:
            if int(pwd["id_usuario"]) != user_id:
                continue
            if pwd.get("dominio", "").lower() != dominio.lower():
                continue
            if cripto.descriptografar(pwd.get("login", "")) != login:
                continue
            encrypted = PasswordService._criptografar_senha(
                {"dominio": dominio, "login": login, "senha": senha}
            )
            pwd.update(encrypted)
            db.save(data)
            logger.info("Senha atualizada", f"dominio: {dominio}")
            return response_ok(
                PasswordService._descriptografar_senha(pwd), "Senha atualizada"
            )

        new_pwd: dict[str, Any] = PasswordService._criptografar_senha(
            {
                "id_senha": get_next_id(data["passwords"], "id_senha"),
                "id_usuario": user_id,
                "dominio": dominio,
                "login": login,
                "senha": senha,
            }
        )
        data["passwords"].append(new_pwd)
        db.save(data)
        logger.info("Senha salva", f"dominio: {dominio}")
        return response_ok(
            PasswordService._descriptografar_senha(new_pwd), "Senha salva"
        )

    @staticmethod
    def editar(
        user_id: int, id_senha: int, dominio: str, login: str, senha: str
    ) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        for pwd in data["passwords"]:
            if int(pwd["id_senha"]) != int(id_senha):
                continue
            if int(pwd["id_usuario"]) != int(user_id):
                return response_error("Permissão negada")

            encrypted = PasswordService._criptografar_senha(
                {"dominio": dominio, "login": login, "senha": senha}
            )
            pwd.update(encrypted)
            db.save(data)
            logger.info("Senha editada", f"id: {id_senha}")
            return response_ok(
                PasswordService._descriptografar_senha(pwd), "Senha atualizada"
            )

        return response_error("Senha não encontrada")

    @staticmethod
    def excluir(user_id: int, id_senha: int) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        initial_len: int = len(data["passwords"])
        data["passwords"] = [
            p
            for p in data["passwords"]
            if int(p["id_senha"]) != int(id_senha)
            or int(p["id_usuario"]) != int(user_id)
        ]

        if len(data["passwords"]) < initial_len:
            db.save(data)
            logger.info("Senha excluída", f"id: {id_senha}")
            return response_ok(None, "Senha excluída")
        return response_error("Senha não encontrada")

    @staticmethod
    def update_insert(user_id: int, items: list[dict[str, Any]]) -> dict[str, Any]:
        data: dict[str, Any] = db.load()
        count: int = 0

        for item in items:
            dominio: str = item.get("dominio", "")
            login: str = item.get("login", "")
            senha: str = item.get("senha", "")

            for pwd in data["passwords"]:
                if int(pwd["id_usuario"]) != user_id:
                    continue
                if pwd.get("dominio", "").lower() != dominio.lower():
                    continue
                if cripto.descriptografar(pwd.get("login", "")) != login:
                    continue
                pwd["senha"] = cripto.criptografar(senha)
                count += 1
                break
            else:
                new_pwd: dict[str, Any] = PasswordService._criptografar_senha(
                    {
                        "id_senha": get_next_id(data["passwords"], "id_senha"),
                        "id_usuario": user_id,
                        "dominio": dominio,
                        "login": login,
                        "senha": senha,
                    }
                )
                data["passwords"].append(new_pwd)
                count += 1

        db.save(data)
        logger.info("Bulk update", f"processadas: {count}")
        return response_ok(None, f"{count} senhas processadas")
