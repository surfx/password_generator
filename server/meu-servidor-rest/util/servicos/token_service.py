from __future__ import annotations
import uuid
import base64
import datetime
from typing import Any

from util.database import db
from util.logger import logger


def get_next_id(collection: list[dict[str, Any]], id_field: str = "id") -> int:
    if not collection:
        return 1

    ids: list[int] = [
        int(item.get(id_field, 0))
        for item in collection
        if str(item.get(id_field, 0)).isdigit()
    ]
    return max(ids) + 1 if ids else 1


class TokenService:
    @staticmethod
    def validate(token_str: str | None) -> dict[str, Any] | None:
        if not token_str:
            return None

        candidates: list[str] = [token_str]
        try:
            decoded: str = base64.b64decode(token_str).decode("utf-8")
            candidates.append(decoded)
        except Exception:
            pass

        for candidate in candidates:
            for token in db.load().get("tokens", []):
                if token["token"] != candidate:
                    continue
                if token.get("validade") is None:
                    return token
                try:
                    val: datetime.datetime = datetime.datetime.strptime(
                        token["validade"], "%Y-%m-%d %H:%M:%S"
                    )
                    if val >= datetime.datetime.now():
                        return token
                except Exception:
                    pass
        return None

    @staticmethod
    def create(user: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = db.load()

        data["tokens"] = [
            t
            for t in data["tokens"]
            if int(t.get("id_usuario", 0)) != int(user["id_usuario"])
        ]

        token_str: str = str(uuid.uuid4())
        new_token: dict[str, Any] = {
            "id_token": get_next_id(data["tokens"], "id_token"),
            "id_usuario": user["id_usuario"],
            "token": token_str,
            "validade": None,
        }
        data["tokens"].append(new_token)
        db.save(data)

        logger.info("Token criado", f"usuario_id: {user['id_usuario']}")
        return new_token

    @staticmethod
    def remove(token_str: str) -> bool:
        data: dict[str, Any] = db.load()
        initial_len: int = len(data["tokens"])

        token_to_remove: str = token_str
        try:
            token_to_remove = base64.b64decode(token_str).decode("utf-8")
        except Exception:
            pass

        data["tokens"] = [
            t
            for t in data["tokens"]
            if t["token"] != token_str and t["token"] != token_to_remove
        ]

        if len(data["tokens"]) < initial_len:
            db.save(data)
            logger.info("Token removido", f"token: {token_str[:8]}...")
            return True
        return False

    @staticmethod
    def clean() -> None:
        data: dict[str, Any] = db.load()
        now: datetime.datetime = datetime.datetime.now()
        valid_tokens: list[dict[str, Any]] = []

        for token in data["tokens"]:
            if token.get("validade") is None:
                valid_tokens.append(token)
                continue
            try:
                val: datetime.datetime = datetime.datetime.strptime(
                    token["validade"], "%Y-%m-%d %H:%M:%S"
                )
                if val > now:
                    valid_tokens.append(token)
            except Exception:
                pass

        valid_tokens.sort(key=lambda x: x.get("validade") or "", reverse=True)

        unique: dict[int, dict[str, Any]] = {}
        for token in valid_tokens:
            uid: int = token["id_usuario"]
            if uid not in unique:
                unique[uid] = token

        data["tokens"] = list(unique.values())
        db.save(data)

        logger.info("Tokens limpos", f"restantes: {len(data['tokens'])}")
