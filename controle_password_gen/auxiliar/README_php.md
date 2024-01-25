# Install php linux

[instalar php linux](https://www.php.com.br/instalacao-php-linux)

```
sudo apt-get update
sudo apt-get install apache2 php libapache2-mod-php
sudo apt-get install php-soap php-xml php-curl php-opcache php-gd php-sqlite3 php-mbstring php-pgsql php-mysql
```

```
a2dismod mpm_event
a2dismod mpm_worker
a2enmod  mpm_prefork
a2enmod  rewrite
a2enmod  php8.1
```

## Dev

```
echo "" >> /etc/php/8.1/apache2/php.ini
echo "error_log = /tmp/php_errors.log" >> /etc/php/8.1/apache2/php.ini
echo "display_errors = On"             >> /etc/php/8.1/apache2/php.ini
echo "memory_limit = 256M"             >> /etc/php/8.1/apache2/php.ini
echo "max_execution_time = 120"        >> /etc/php/8.1/apache2/php.ini
echo "error_reporting = E_ALL"         >> /etc/php/8.1/apache2/php.ini
echo "file_uploads = On"               >> /etc/php/8.1/apache2/php.ini
echo "post_max_size = 100M"            >> /etc/php/8.1/apache2/php.ini
echo "upload_max_filesize = 100M"      >> /etc/php/8.1/apache2/php.ini
echo "session.gc_maxlifetime = 14000"  >> /etc/php/8.1/apache2/php.ini
```

## Prod

```
echo "display_errors = Off" >> php.ini
echo "error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT & ~E_NOTICE" >> php.ini
```

## Segurança

```
echo "session.name = CUSTOMSESSID"   >> /etc/php/8.1/apache2/php.ini
echo "session.use_only_cookies = 1"        >> /etc/php/8.1/apache2/php.ini
echo "session.cookie_httponly = true"      >> /etc/php/8.1/apache2/php.ini
echo "session.use_trans_sid = 0"           >> /etc/php/8.1/apache2/php.ini
```

## Reiniciar apache

`service apache2 restart`

Ou

```
sudo /etc/init.d/apache2 stop
sudo /etc/init.d/apache2 start
```

Salvar os projetos em: `/var/www/html`

(pelo windows: `\\wsl.localhost\Ubuntu-22.04\var\www\html\helloworld`)

criar uma pasta helloworld

```
sudo mkdir helloworld
sudo chmod 777 helloworld
```

[https://www.youtube.com/watch?v=-0XgLRAQ6eE](https://www.youtube.com/watch?v=-0XgLRAQ6eE)

```
$ wsl ~
$ ip a
```

- [http://192.168.0.4/helloworld/](http://192.168.0.4/helloworld/)

# URLS

- [instalar php linux](https://www.php.com.br/instalacao-php-linux)
- [https://www.youtube.com/watch?v=-0XgLRAQ6eE](https://www.youtube.com/watch?v=-0XgLRAQ6eE)
- [http://192.168.0.4/helloworld/](http://192.168.0.4/helloworld/)
