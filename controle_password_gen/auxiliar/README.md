# URLS

- [php e mysql](https://www.w3schools.com/php/php_mysql_intro.asp)
- [base64encode](https://www.base64encode.org)


# Métodos

# Login

## Login

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-d '{ "login": "eme@...", "senha": "..." }' \
'http://localhost/helloworld/code/service/userservice/?tipo=login'
```

# Token

## Token get

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-d '{"login": "mar@...","senha": "..."}' \
'http://localhost/helloworld/code/service/authenticacao/'
```

## Validar Token

token em base 64

```bash
curl -k -i -X GET \
-H "authorization:M...U=" \
'http://localhost/helloworld/code/service/userservice/?tipo=tokenvalido'
```

# User

## User List

Token em base 64 do usuário admin

```bash
curl -k -i -X GET \
-H "Authorization:MW...=" \
'http://localhost/helloworld/code/service/userservice/?tipo=listuser'
```

## User insert

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-d '{"nome": "novo usuário","login": "new@...","senha": "..."}' \
'http://localhost/helloworld/code/service/userservice/?tipo=insert'
```

## User delete

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-H "authorization:Y...k=" \
-d '{"uuid": "81d9f5a...","id": "7","login": "new@..."}' \
'http://localhost/helloworld/code/service/userservice/?tipo=excluir'
```

## User update

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-H "authorization:M...ZjM=" \
-d '{ "id_usuario": 7, "nome": "novo nome", "uuid": "81...2",  "login": "new...", "senha": "s...", "verificado": "1", "ativo": "1" }' \
'http://localhost/helloworld/code/service/userservice/?tipo=update'
```


# Senha

## Senha salvar

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-H "authorization:N...=" \
-d '{"id_usuario": "2","dominio": "...","login": "user2@...","senha": "..."}' \
'http://localhost/helloworld/code/service/senhas/?tipo=salvar'
```

## Senha listar

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-H "authorization:N...=" \
-d '{"id_usuario": "2","dominio": "..."}' \
'http://localhost/helloworld/code/service/senhas/?tipo=listar'
```

## Senha editar

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "authorization:N...Y=" \
-H "Content-Type:application/json" \
-d '{"id_senha": 1,"id_usuario": "2","dominio": "...","login": "user2@...","senha": "..."}' \
'http://localhost/helloworld/code/service/senhas/?tipo=editar'
```

## Senha excluir

token em base 64 do usuário

```bash
curl -k -i -X POST \
-H "Content-Type:application/json" \
-H "authorization:O...=" \
-d '{"id_senha": 4,"id_usuario": 7, "dominio": "..."}' \
'http://localhost/helloworld/code/service/senhas/?tipo=excluir'
```
