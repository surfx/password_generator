@echo off
echo Registrando Native Messaging Host...
cd /d "%~dp0server\native_host"
powershell -ExecutionPolicy Bypass -File install_host.ps1 -ExtensionID kngehbelineohghkkmkbhmkcolkonaif
echo.
pause
