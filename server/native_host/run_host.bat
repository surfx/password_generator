@echo off
setlocal EnableDelayedExpansion

set LOGFILE=%~dp0native_host.log
echo [%DATE% %TIME%] Starting Native Host >> "%LOGFILE%"

set PYTHON_EXE=%~dp0..\meu-servidor-rest\.venv\Scripts\python.exe
set SCRIPT=%~dp0native_host.py

echo PYTHON_EXE=%PYTHON_EXE% >> "%LOGFILE%"
echo SCRIPT=%SCRIPT% >> "%LOGFILE%"

if not exist "%PYTHON_EXE%" (
    echo ERROR: Python executable not found at %PYTHON_EXE% >> "%LOGFILE%"
    exit /b 1
)

if not exist "%SCRIPT%" (
    echo ERROR: Python script not found at %SCRIPT% >> "%LOGFILE%"
    exit /b 1
)

REM Executa o script Python (Chrome vai enviar mensagens via stdin)
"%PYTHON_EXE%" "%SCRIPT%" 2>>"%LOGFILE%"

set EXIT_CODE=%ERRORLEVEL%
echo [%DATE% %TIME%] Script exited with code %EXIT_CODE% >> "%LOGFILE%"
exit /b %EXIT_CODE%