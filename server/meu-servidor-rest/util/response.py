from typing import Any, Optional


def response_ok(data: Any = None, msg: str = "Sucesso", token: Any = None):
    res = {"ok": True, "msg": msg, "data": data}
    if token:
        res["token"] = token
    return res


def response_error(msg: str = "Erro"):
    return {"ok": False, "msg": msg, "data": None}
