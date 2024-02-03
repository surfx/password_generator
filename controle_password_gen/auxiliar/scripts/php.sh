#!/bin/bash
# start: apache e mysql. Script deve ficar no ubuntu (wsl ~)
sudo /etc/init.d/apache2 stop
sudo /etc/init.d/apache2 start

sudo /etc/init.d/mysql stop
sudo /etc/init.d/mysql start