use cemst_35798779_passwordsgen;

/*----------------------
    APENAS PARA TESTES
----------------------*/

-- TODO: criptografar as senhas

INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES ('Jac', uuid(), 'teste@gmail.com', '123', '0', '1');
INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES ('User1', uuid(), 'one_teste@gmail.com', '111', '0', '1');
INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES ('User2', uuid(), 'two_teste@gmail.com', '222', '1', '1');
INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES ('User3', uuid(), 'three_teste@gmail.com', '333', '0', '1');
COMMIT;

-- SELECT id_usuario, nome, uuid, login, senha, verificado FROM usuarios;

INSERT INTO senhas (id_usuario, dominio, login, senha) VALUES (1, 'gmail', 'sadasd@gmail.com', 'minha_senha_1');
INSERT INTO senhas (id_usuario, dominio, login, senha) VALUES (1, 'gmail', 'asdas@gmail.com', 'minha_senha_2');
INSERT INTO senhas (id_usuario, dominio, login, senha) VALUES (1, 'gmail', 'sadsad@gmail.com', 'minha_senha_3');
INSERT INTO senhas (id_usuario, dominio, login, senha) VALUES (1, 'hotmail', 'sdf43@hotmail.com', 'minha_senha_4');
COMMIT;

-- SELECT id_senha, id_usuario, dominio, login, senha FROM senhas;

-- SELECT u.*, s.*
-- FROM usuarios u
-- LEFT JOIN senhas s ON s.id_usuario = u.id_usuario
-- ;