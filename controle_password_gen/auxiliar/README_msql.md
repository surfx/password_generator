# Install

```
sudo apt update -y
sudo apt install mysql-server -y
sudo /etc/init.d/mysql start
```

```
wsl --shutdown
wsl ~
```

```
sudo /etc/init.d/mysql stop
sudo /etc/init.d/mysql start
sudo /etc/init.d/mysql restart

sudo /etc/init.d/mysql status

$ mysql -V
mysql  Ver 8.0.35-0ubuntu0.22.04.1 for Linux on x86_64 ((Ubuntu))
```

# Senha padrão mysql (não tem, vazio)

```
$ sudo mysql -u root
mysql> USE mysql;
mysql> UPDATE user SET plugin='mysql_native_password' WHERE User='root';
mysql> FLUSH PRIVILEGES;
mysql> exit;
$ sudo service mysql restart
```

```
mysql -u root -h 127.0.0.1 -p -P 3306
* sem senha padrão
SHOW DATABASES;
exit
```


# Alterar a porta para poder acessar o mysql do windows

```
$ sudo vim /etc/mysql/my.cnf
[mysqld]
validate_password.policy=LOW
port=33066
```

# Criar usuário

```
mysql -u root -h localhost -p -P 33066

CREATE USER 'teste'@'localhost' IDENTIFIED BY '234234234';
GRANT ALL PRIVILEGES ON *.* TO 'teste'@'localhost' WITH GRANT OPTION;
GRANT CREATE, SELECT ON *.* TO 'teste'@'localhost';
CREATE USER 'teste'@'%' IDENTIFIED BY '2234234';
GRANT ALL PRIVILEGES ON *.* TO 'teste'@'%' WITH GRANT OPTION;
GRANT CREATE, SELECT ON *.* TO 'teste'@'%';
FLUSH PRIVILEGES;

-- DROP USER 'teste'@'localhost';


SHOW GRANTS FOR 'teste'@'localhost';

exit
```

```
mysql -u teste -h localhost -p -P 33066
```


# ifconfig

```
$ sudo apt install net-tools
$ ifconfig
```















