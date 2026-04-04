from typing import Optional, Dict, Any, List, Union
from fastapi import FastAPI, Header, Query, Body
from fastapi.middleware.cors import CORSMiddleware

from util import logger, response_ok, response_error, TokenService
from util.servicos import UserService, PasswordService


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/authenticacao/")
@app.get("/authenticacao/")
async def authenticacao(
    tipo: str = Query(...), body: Dict[str, Any] = Body(default={})
) -> Dict[str, Any]:
    if tipo == "token":
        login: str = body.get("login") or ""
        senha: str = body.get("senha") or ""
        user = UserService.find_by_login(login, senha)
        if user:
            token = TokenService.create(user)
            return response_ok(token, "Token gerado")
        return response_error("Login ou senha inválidos")

    if tipo == "tokensinvalidos":
        return response_ok(None, "Tokens limpos")

    return response_error("Tipo inválido em autenticacao")


@app.post("/userservice/")
@app.get("/userservice/")
async def userservice(
    tipo: str = Query(...),
    authorization: Optional[str] = Header(None),
    body: Dict[str, Any] = Body(default={}),
) -> Dict[str, Any]:
    if tipo == "login":
        login: str = body.get("login") or ""
        senha: str = body.get("senha") or ""
        return UserService.login(login, senha)

    if tipo == "insert":
        nome: str = body.get("nome") or ""
        login: str = body.get("login") or ""
        senha: str = body.get("senha") or ""
        return UserService.insert(nome, login, senha)

    token_info = TokenService.validate(authorization)
    if not token_info:
        if tipo == "tokenvalido":
            return response_error("Token inválido")
        return response_error("Não autorizado")

    if tipo == "tokenvalido":
        return response_ok(token_info, "Token válido")

    if tipo == "logout":
        if TokenService.remove(authorization or ""):
            return response_ok(None, "Logout realizado com sucesso")
        return response_error("Token não fornecido para logout")

    if tipo == "listuser":
        return UserService.list_all()

    if tipo in ("update", "update_part"):
        uid: int = int(body.get("id_usuario") or 0)
        return UserService.update(uid, body)

    if tipo == "inativar":
        uid: int = int(body.get("id_usuario") or 0)
        return UserService.inativar(uid)

    return response_error("Tipo não implementado em userservice")


@app.post("/senhas/")
@app.get("/senhas/")
async def senhas_service(
    tipo: str = Query(...),
    authorization: Optional[str] = Header(None),
    body: Union[Dict[str, Any], List[Dict[str, Any]]] = Body(default={}),
) -> Dict[str, Any]:
    token_info = TokenService.validate(authorization)
    if not token_info:
        return response_error("Não autorizado")

    user_id: int = int(token_info["id_usuario"])

    if tipo == "listar":
        if isinstance(body, list):
            return response_error("Body inválido")
        dominio: str = body.get("dominio") or ""
        return PasswordService.listar(user_id, dominio)

    if tipo == "salvar":
        if isinstance(body, list):
            return response_error("Body inválido")
        return PasswordService.salvar(
            user_id,
            body.get("dominio") or "",
            body.get("login") or "",
            body.get("senha") or "",
        )

    if tipo == "editar":
        if isinstance(body, list):
            return response_error("Body inválido")
        id_senha: int = int(body.get("id_senha") or 0)
        return PasswordService.editar(
            user_id,
            id_senha,
            body.get("dominio") or "",
            body.get("login") or "",
            body.get("senha") or "",
        )

    if tipo == "excluir":
        if isinstance(body, list):
            return response_error("Body inválido")
        id_senha: int = int(body.get("id_senha") or 0)
        return PasswordService.excluir(user_id, id_senha)

    if tipo == "update_insert":
        if not isinstance(body, list):
            return response_error("Esperado lista de senhas")
        return PasswordService.update_insert(user_id, body)

    return response_error("Tipo não implementado em senhas")


@app.post("/testes/")
async def testes_service(tipo: str = Query(...)):
    if tipo == "cors":
        return response_ok(None, "CORS OK")
    return response_error("Teste desconhecido")


@app.post("/logs/")
async def logs_service(
    level: str = Query(...),
    message: str = Query(...),
    details: str = Query(default=""),
    source: str = Query(default="JS"),
):
    if level == "error":
        logger.error(message, details, source)
    elif level == "warning":
        logger.warning(message, details, source)
    elif level == "debug":
        logger.debug(message, details, source)
    else:
        logger.info(message, details, source)
    return response_ok(None, "Log registrado")


if __name__ == "__main__":
    try:
        TokenService.clean()
    except:
        pass

    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
