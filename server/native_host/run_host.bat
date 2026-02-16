@echo off
set LOGFILE="%~dp0native_host.log"
echo [%DATE% %TIME%] Starting Native Host >> %LOGFILE%

set PYTHON_EXE="%~dp0..\meu-servidor-rest\.venv\Scripts\python.exe"
set SCRIPT="%~dp0native_host.py"

echo PYTHON_EXE=%PYTHON_EXE% >> %LOGFILE%
echo SCRIPT=%SCRIPT% >> %LOGFILE%

if not exist %PYTHON_EXE% (
    echo ERROR: Python executable not found at %PYTHON_EXE% >> %LOGFILE%
    exit /b 1
)

if not exist %SCRIPT% (
    echo ERROR: Python script not found at %SCRIPT% >> %LOGFILE%
    exit /b 1
)

%PYTHON_EXE% %SCRIPT% %* 2>>%LOGFILE%
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Script exited with code %ERRORLEVEL% >> %LOGFILE%
)
echo [%DATE% %TIME%] Exiting Native Host >> %LOGFILE%
