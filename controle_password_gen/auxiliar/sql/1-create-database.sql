CREATE DATABASE cemst_35798779_passwordsgen;

--SHOW DATABASES;
use cemst_35798779_passwordsgen;

DROP TABLE senhas;
DROP TABLE usuarios;
DROP TABLE tokens;


CREATE TABLE usuarios (
    id_usuario int NOT NULL AUTO_INCREMENT,
    nome varchar(255) NOT NULL,
    uuid varchar(100) NOT NULL,
    login varchar(255) NOT NULL,
    senha varchar(1000) NOT NULL,
    verificado char(1) NOT NULL,
    ativo char(1) NOT NULL,
    
    PRIMARY KEY (id_usuario)
);

CREATE TABLE senhas (
    id_senha int NOT NULL AUTO_INCREMENT,
    id_usuario int NOT NULL,
    
    dominio varchar(255) NOT NULL,
    login varchar(255) NOT NULL,
    senha varchar(1000) NOT NULL,
    
    PRIMARY KEY (id_senha),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

CREATE TABLE tokens (
    id int NOT NULL,
    token varchar(255) NOT NULL,
    validade DATETIME NOT NULL   
);


-- master, senha: plana: { b6K+x!nasGfaCDk, cript: UpE5MOvWx1P5gNKVsGrs }, id do master: 1
INSERT INTO usuarios (nome, uuid, login, senha, verificado, ativo) VALUES ('Master', uuid(), 'master123@master.com', 'UpE5MOvWx1P5gNKVsGrs', '1', '1');
COMMIT;
