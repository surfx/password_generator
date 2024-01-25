# URLS

- [php e mysql](https://www.w3schools.com/php/php_mysql_intro.asp)
- [base64encode](https://www.base64encode.org)


# Métodos

## Tokens

*obs*: `usuario` e `senha` são base 64

admin:

```
curl -i -k -X POST \
   -H "Content-Type:application/json" \
   -H "usuario:bWFzdGVyMTIzQG1hc3Rlci5jb20=" \
   -H "senha:YjZLK3ghbmFzR2ZhQ0Rr" \
 'http://192.168.0.4/helloworld/code/service/authenticacao/'
```

usuário comum:

```
curl -i -k -X POST \
   -H "Content-Type:application/json" \
   -H "usuario:ZW1lQGdtYWlsLmNvbQ==" \
   -H "senha:MTIz" \
 'http://192.168.0.4/helloworld/code/service/authenticacao/'
```

## Usuários

TODO: add header validation

Listar top 10 ativos:

`curl -i -k -X GET http://192.168.0.4/helloworld/code/service/userservice/?tipo=listuser`

