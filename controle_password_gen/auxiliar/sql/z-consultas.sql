use cemst_35798779_passwordsgen;


select * from usuarios;

SELECT id, token, validade FROM tokens;

select id_senha,id_usuario,dominio,login,senha from senhas;

--delete from usuarios where id_usuario in (6);


SELECT id, token, validade FROM tokens
WHERE token = 'de13a4540b87e0f8065c77b5860f1c25'
AND validade >= CURRENT_TIMESTAMP
;

SELECT id_senha,id_usuario,dominio,login,senha FROM senhas 
WHERE id_usuario = 2 AND dominio = 'youtube' AND 
login = 'teste@gmail.com' 
AND senha = 'E+dWW7CT2lTrtNCS'
LIMIT 1
;

SELECT * from senhas WHERE id_senha = 1 AND id_usuario = 2 AND dominio = 'youtube';

--UPDATE senhas SET id_usuario=7;
DELETE FROM senhas WHERE id_senha = 2 AND id_usuario = 2 AND dominio = 'youtube';
--update usuarios set ativo = 1;




